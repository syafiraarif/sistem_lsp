import React, { useState, useEffect } from "react";
import {
  CalendarCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Loader2,
  Search,
  UserCheck,
  X,
  Eye,
  MapPin,
  GraduationCap,
  User
} from "lucide-react";
import api from "../../services/api";

const AsesiTerjadwal = () => {
  const [asesiList, setAsesiList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const limit = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedDetail, setSelectedDetail] = useState(null);

  const fetchAsesiTerjadwal = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/peserta-jadwal/global?status=terjadwal");
      setAsesiList(res.data.data || []);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAsesiTerjadwal();
  }, []);

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

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

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

  const totalPages = Math.ceil(filteredData.length / limit) || 1;
  const currentData = filteredData.slice((currentPage - 1) * limit, currentPage * limit);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 md:p-8">
      <div className="flex flex-col gap-6">
        
        <div className="relative overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white p-6 shadow-sm">
          <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/2 rounded-full bg-[#CC6B27]/10 blur-3xl" />
          <div className="relative z-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="m-0 mb-1 text-[24px] font-black text-[#071E3D] md:text-[28px]">Asesi Terjadwal</h2>
              <p className="m-0 text-[14px] font-medium text-[#182D4A]/70">
                Daftar asesi yang telah didaftarkan pada jadwal asesmen dan siap mengikuti uji kompetensi.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <StatCard icon={<CalendarDays size={22} />} label="Total Terjadwal" value={`${asesiList.length} Asesi`} tone="blue" />
          <StatCard icon={<ClipboardList size={22} />} label="Data Tampil" value={`${currentData.length} Data`} tone="orange" />
          <StatCard icon={<UserCheck size={22} />} label="Hasil Filter" value={`${filteredData.length} Data`} tone="navy" />
        </div>

        <div className="rounded-xl border border-[#071E3D]/10 bg-white p-6 shadow-sm">
          
          <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <h4 className="m-0 flex items-center gap-2 text-[16px] font-bold text-[#071E3D]">
              <CalendarCheck size={18} className="text-[#CC6B27]" />
              Daftar Asesi Terjadwal
            </h4>

            <div className="group relative w-full sm:w-72">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 transition-colors group-focus-within:text-[#CC6B27]" />
              <input
                type="text"
                placeholder="Cari NIK, Nama, atau Skema..."
                className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] py-2.5 pl-10 pr-4 text-[13px] text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
            <table className="w-full min-w-[1000px] border-collapse bg-white text-left">
              <thead>
                <tr>
                  <th className="w-12 border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">No</th>
                  <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">NIK</th>
                  <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Nama Lengkap</th>
                  <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Jadwal / Kegiatan</th>
                  <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Skema</th>
                  <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Status</th>
                  <th className="w-24 border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center">
                      <Loader2 className="mx-auto mb-3 animate-spin text-[#CC6B27]" size={36} />
                      <p className="text-[14px] font-medium text-[#182D4A]">Memuat data asesi...</p>
                    </td>
                  </tr>
                ) : currentData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center">
                      <CalendarCheck size={48} className="mx-auto mb-3 text-[#071E3D]/20" />
                      <p className="text-[14px] font-medium text-[#182D4A]">Data jadwal tidak ditemukan.</p>
                    </td>
                  </tr>
                ) : (
                  currentData.map((item, index) => {
                    const profile = getAsesiProfile(item.user);
                    const jadwalObj = getJadwal(item);
                    const skemaObj = getSkema(jadwalObj);

                    return (
                      <tr key={item.id_peserta || index} className="border-b border-[#071E3D]/5 transition-colors hover:bg-[#CC6B27]/5">
                        <td className="px-4 py-3 text-center text-[13.5px] font-semibold text-[#071E3D]">
                          {(currentPage - 1) * limit + index + 1}
                        </td>
                        <td className="px-4 py-3 font-mono text-[13px] font-bold text-[#CC6B27]">
                          {profile.nik || "-"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-[13.5px] font-bold text-[#071E3D]">
                            {profile.nama_lengkap || item.user?.nama_lengkap || item.user?.email || "-"}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[13px] font-medium text-[#182D4A]">
                          {jadwalObj.nama_jadwal || jadwalObj.nama_kegiatan || "-"}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[#182D4A]">
                          {skemaObj.judul_skema || skemaObj.nama_skema || "-"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-center">
                          <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600">
                            {item.status || "Terjadwal"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedDetail(item)}
                            className="rounded-lg bg-[#182D4A]/10 p-1.5 text-[#182D4A] transition-colors hover:bg-[#182D4A] hover:text-white"
                            title="Lihat Detail"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {filteredData.length > 0 && (
            <div className="mt-6 flex items-center justify-between border-t border-[#071E3D]/10 pt-5 text-[13px] font-medium text-[#182D4A]">
              <span>
                Menampilkan {((currentPage - 1) * limit) + 1} - {Math.min(currentPage * limit, filteredData.length)} dari {filteredData.length} data
              </span>
              <div className="flex items-center gap-2">
                <button 
                  className="rounded-md border border-[#071E3D]/20 p-1.5 transition-all hover:border-[#CC6B27]/30 hover:bg-[#CC6B27]/10 hover:text-[#CC6B27] disabled:opacity-50 disabled:hover:border-[#071E3D]/20 disabled:hover:bg-transparent disabled:hover:text-[#182D4A]"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  <ChevronLeft size={18}/>
                </button>
                <span className="rounded-md border border-[#071E3D]/10 bg-[#FAFAFA] px-4 py-1.5 font-bold text-[#071E3D]">
                  {currentPage} / {totalPages}
                </span>
                <button 
                  className="rounded-md border border-[#071E3D]/20 p-1.5 transition-all hover:border-[#CC6B27]/30 hover:bg-[#CC6B27]/10 hover:text-[#CC6B27] disabled:opacity-50 disabled:hover:border-[#071E3D]/20 disabled:hover:bg-transparent disabled:hover:text-[#182D4A]"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  <ChevronRight size={18}/>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedDetail && (() => {
        const jadwalObj = getJadwal(selectedDetail);
        const skemaObj = getSkema(jadwalObj);
        const profile = getAsesiProfile(selectedDetail.user);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/40 p-4 backdrop-blur-sm">
            <div className="flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
              
              <div className="flex items-center justify-between border-b border-[#071E3D]/10 bg-[#FAFAFA] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[#CC6B27]/10 p-2 text-[#CC6B27]">
                    <CalendarCheck size={20} />
                  </div>
                  <div>
                    <h3 className="m-0 text-[16px] font-bold text-[#071E3D]">Detail Jadwal Asesi</h3>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-lg p-1.5 text-[#182D4A] transition-colors hover:bg-[#CC6B27]/10 hover:text-[#CC6B27]"
                  onClick={() => setSelectedDetail(null)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="custom-scrollbar flex-1 overflow-y-auto bg-white p-6">
                <div className="space-y-6">
                  
                  <DetailSection icon={<User size={16} />} title="Informasi Asesi">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <DetailItem label="Nama Lengkap">
                        {profile.nama_lengkap || selectedDetail.user?.nama_lengkap || "-"}
                      </DetailItem>
                      <DetailItem label="NIK">
                        {profile.nik || "-"}
                      </DetailItem>
                    </div>
                  </DetailSection>

                  <DetailSection icon={<GraduationCap size={16} />} title="Detail Asesmen & Skema">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <DetailItem label="Nama Jadwal / Kegiatan">
                          {jadwalObj.nama_jadwal || jadwalObj.nama_kegiatan || "-"}
                        </DetailItem>
                      </div>
                      <div className="md:col-span-2">
                        <DetailItem label="Skema Sertifikasi">
                          {skemaObj.judul_skema || skemaObj.nama_skema || "-"}
                        </DetailItem>
                      </div>
                      <DetailItem label="Metode Uji">
                        {jadwalObj.pelaksanaan_uji || "-"}
                      </DetailItem>
                      <DetailItem label="Tanggal Pelaksanaan">
                        {jadwalObj.tgl_awal ? `${formatDate(jadwalObj.tgl_awal)} - ${formatDate(jadwalObj.tgl_akhir)}` : "-"}
                      </DetailItem>
                    </div>
                  </DetailSection>

                  <DetailSection icon={<MapPin size={16} />} title="Lokasi TUK">
                    <DetailItem label="Tempat Uji Kompetensi">
                      {jadwalObj.tuk?.nama_tuk || jadwalObj.tuk?.nama || "TUK Sewaktu"}
                    </DetailItem>
                  </DetailSection>

                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-[#071E3D]/10 bg-[#FAFAFA] px-6 py-4">
                <button
                  type="button"
                  className="rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-5 py-2.5 text-[13px] font-bold text-[#182D4A] transition-colors hover:bg-[#E2E8F0]"
                  onClick={() => setSelectedDetail(null)}
                >
                  Tutup
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CC6B27; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a8561f; }
      ` }} />
    </div>
  );
};


const StatCard = ({ icon, label, value, tone = "orange" }) => {
  const tones = {
    orange: "bg-[#CC6B27]/10 text-[#CC6B27]",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-500",
    blue: "bg-blue-50 text-blue-600",
    navy: "bg-[#071E3D]/10 text-[#071E3D]"
  };

  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#071E3D]/10 bg-white p-5 shadow-sm">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#182D4A]/60">{label}</p>
        <p className="mt-1 text-[20px] font-black text-[#071E3D]">{value}</p>
      </div>
    </div>
  );
};

function DetailSection({ icon, title, children }) {
  return (
    <div className="rounded-xl border border-[#071E3D]/10 bg-white p-5 shadow-sm">
      <h4 className="mb-4 flex items-center gap-2 border-b border-[#CC6B27]/20 pb-3 text-[14px] font-bold text-[#CC6B27]">
        {icon} {title}
      </h4>
      {children}
    </div>
  );
}

function DetailItem({ label, children, icon }) {
  return (
    <div>
      <p className="mb-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-[#071E3D]">
        {icon}
        {label}
      </p>
      <div className="text-[13px] font-medium text-[#182D4A]/80">{children}</div>
    </div>
  );
}

export default AsesiTerjadwal;