import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  BadgeX,
  ClipboardList,
  Search,
  UserCheck,
  X,
  Eye,
  MapPin,
  GraduationCap,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CalendarDays,
  AlertTriangle
} from "lucide-react";
import api from "../../services/api";

const AsesiBelumKompeten = () => {
  const [asesiList, setAsesiList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const limit = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedDetail, setSelectedDetail] = useState(null);
  const [selectedJadwal, setSelectedJadwal] = useState(null);

  const fetchAsesiBelumKompeten = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/peserta-jadwal/global?status=belum_kompeten");
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
          <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/2 rounded-full bg-red-500/10 blur-3xl" />
          <div className="relative z-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="m-0 mb-1 text-[24px] font-black text-[#071E3D] md:text-[28px]">Asesi Belum Kompeten</h2>
              <p className="m-0 text-[14px] font-medium text-[#182D4A]/70">
                Daftar asesi yang belum lulus uji kompetensi dan direkomendasikan belum kompeten.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <StatCard icon={<BadgeX size={22} />} label="Total BK" value={`${asesiList.length} Asesi`} tone="red" />
          <StatCard icon={<ClipboardList size={22} />} label="Data Tampil" value={`${currentData.length} Data`} tone="orange" />
          <StatCard icon={<UserCheck size={22} />} label="Hasil Filter" value={`${filteredData.length} Data`} tone="navy" />
        </div>

        <div className="rounded-xl border border-[#071E3D]/10 bg-white p-6 shadow-sm">
          
          <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <h4 className="m-0 flex items-center gap-2 text-[16px] font-bold text-[#071E3D]">
              <ShieldAlert size={18} className="text-red-500" />
              Daftar Asesi Belum Kompeten
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
                  <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Skema</th>
                  <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Nilai</th>
                  <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center">
                      <Loader2 className="mx-auto mb-3 animate-spin text-[#CC6B27]" size={36} />
                      <p className="text-[14px] font-medium text-[#182D4A]">Memuat data asesi...</p>
                    </td>
                  </tr>
                ) : currentData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center">
                      <AlertTriangle size={48} className="mx-auto mb-3 text-[#071E3D]/20" />
                      <p className="text-[14px] font-medium text-[#182D4A]">Data asesi belum kompeten tidak ditemukan.</p>
                    </td>
                  </tr>
                ) : (
                  currentData.map((item, index) => {
                    const profile = getAsesiProfile(item.user);
                    const jadwalObj = getJadwal(item);
                    const skemaObj = getSkema(jadwalObj);

                    return (
                      <tr key={item.id_peserta || index} className="border-b border-[#071E3D]/5 transition-colors hover:bg-red-50/30">
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
                        <td className="px-4 py-3 text-[13px] text-[#182D4A]">
                          {skemaObj.judul_skema || skemaObj.nama_skema || "-"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-center">
                          <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-red-600">
                            {item.nilai_akhir || "BK"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => setSelectedDetail(item)}
                              className="rounded-lg bg-[#182D4A]/10 p-1.5 text-[#182D4A] transition-colors hover:bg-[#182D4A] hover:text-white"
                              title="Detail Kelulusan"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => setSelectedJadwal(item)}
                              className="rounded-lg bg-blue-50 p-1.5 text-blue-600 border border-blue-100 transition-colors hover:bg-blue-600 hover:text-white"
                              title="Detail Jadwal"
                            >
                              <CalendarDays size={16} />
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
        const profileDetail = getAsesiProfile(selectedDetail.user);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/40 p-4 backdrop-blur-sm">
            <div className="flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#071E3D]/10 bg-[#FAFAFA] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-red-50 p-2 text-red-600"><UserCheck size={20} /></div>
                  <h3 className="m-0 text-[16px] font-bold text-[#071E3D]">Detail Kelulusan Asesi</h3>
                </div>
                <button type="button" className="rounded-lg p-1.5 text-[#182D4A] transition-colors hover:bg-red-50 hover:text-red-600" onClick={() => setSelectedDetail(null)}>
                  <X size={20} />
                </button>
              </div>
              <div className="custom-scrollbar flex-1 overflow-y-auto bg-white p-6">
                <DetailSection icon={<ShieldAlert size={16} />} title="Status & Rekomendasi">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <DetailItem label="NIK">{profileDetail.nik || "-"}</DetailItem>
                    <DetailItem label="Nama Lengkap">{profileDetail.nama_lengkap || selectedDetail.user?.nama_lengkap || "-"}</DetailItem>
                    <DetailItem label="Nilai Akhir">
                      <span className="text-[16px] font-black text-red-600">{selectedDetail.nilai_akhir || "BK"}</span>
                    </DetailItem>
                    <DetailItem label="Status Rekomendasi">
                      <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-red-600">
                        BK - Belum Kompeten
                      </span>
                    </DetailItem>
                    <div className="md:col-span-2">
                      <DetailItem label="Keterangan / Catatan Asesor">
                        <div className="rounded-xl border border-red-100 bg-red-50/50 p-4 text-[13px] italic text-[#182D4A]">
                          {selectedDetail.keterangan || selectedDetail.catatan || "Tidak ada catatan dari asesor."}
                        </div>
                      </DetailItem>
                    </div>
                  </div>
                </DetailSection>
              </div>
              <div className="flex justify-end gap-3 border-t border-[#071E3D]/10 bg-[#FAFAFA] px-6 py-4">
                <button type="button" className="rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-5 py-2.5 text-[13px] font-bold text-[#182D4A] transition-colors hover:bg-[#E2E8F0]" onClick={() => setSelectedDetail(null)}>Tutup</button>
              </div>
            </div>
          </div>
        );
      })()}

      {selectedJadwal && (() => {
        const jadwalObj = getJadwal(selectedJadwal);
        const skemaObj = getSkema(jadwalObj);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/40 p-4 backdrop-blur-sm">
            <div className="flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#071E3D]/10 bg-[#FAFAFA] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-50 p-2 text-blue-600"><CalendarDays size={20} /></div>
                  <h3 className="m-0 text-[16px] font-bold text-[#071E3D]">Detail Jadwal Asesmen</h3>
                </div>
                <button type="button" className="rounded-lg p-1.5 text-[#182D4A] transition-colors hover:bg-red-50 hover:text-red-600" onClick={() => setSelectedJadwal(null)}>
                  <X size={20} />
                </button>
              </div>
              <div className="custom-scrollbar flex-1 overflow-y-auto bg-white p-6">
                <DetailSection icon={<GraduationCap size={16} />} title="Informasi Jadwal">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <DetailItem label="Nama Kegiatan">{jadwalObj.nama_jadwal || jadwalObj.nama_kegiatan || "-"}</DetailItem>
                    </div>
                    <DetailItem label="Skema Sertifikasi">{skemaObj.judul_skema || skemaObj.nama_skema || "-"}</DetailItem>
                    <DetailItem label="Metode Pelaksanaan">{jadwalObj.pelaksanaan_uji || "-"}</DetailItem>
                    <DetailItem label="Tanggal Pelaksanaan">
                      {jadwalObj.tgl_awal ? `${formatDate(jadwalObj.tgl_awal)} - ${formatDate(jadwalObj.tgl_akhir)}` : "-"}
                    </DetailItem>
                    <DetailItem label="Waktu / Jam">{jadwalObj.jam ? `${jadwalObj.jam} WIB` : "-"}</DetailItem>
                    <div className="md:col-span-2">
                      <DetailItem label="Lokasi / URL Agenda">
                        {jadwalObj.url_agenda ? (
                          <a href={jadwalObj.url_agenda} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:underline break-all">
                            {jadwalObj.url_agenda}
                          </a>
                        ) : (
                          <span className="font-medium text-[#182D4A]">-</span>
                        )}
                      </DetailItem>
                    </div>
                  </div>
                </DetailSection>
              </div>
              <div className="flex justify-end gap-3 border-t border-[#071E3D]/10 bg-[#FAFAFA] px-6 py-4">
                <button type="button" className="rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-5 py-2.5 text-[13px] font-bold text-[#182D4A] transition-colors hover:bg-[#E2E8F0]" onClick={() => setSelectedJadwal(null)}>Tutup</button>
              </div>
            </div>
          </div>
        );
      })()}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
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
        {icon} {label}
      </p>
      <div className="text-[13px] font-medium text-[#182D4A]/80">{children}</div>
    </div>
  );
}

export default AsesiBelumKompeten;