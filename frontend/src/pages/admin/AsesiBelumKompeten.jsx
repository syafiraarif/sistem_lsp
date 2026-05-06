// frontend/src/pages/admin/AsesiBelumKompeten.jsx

import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaTimes,
  FaEye,
  FaCalendarAlt,
  FaUserCheck,
} from "react-icons/fa";
import {
  AlertTriangle,
  BadgeX,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Loader2,
  Search,
  ShieldAlert,
  Sparkles,
  UserCheck,
  X,
} from "lucide-react";
import api from "../../services/api";

const AsesiBelumKompeten = () => {
  const [asesiList, setAsesiList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedDetail, setSelectedDetail] = useState(null);
  const [selectedJadwal, setSelectedJadwal] = useState(null);

  const fetchAsesiBelumKompeten = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        "/admin/peserta-jadwal/global?status=belum_kompeten"
      );
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
    return (
      user.ProfileAsesi ||
      user.profileAsesi ||
      user.profile_asesi ||
      user.Profile_Asesi ||
      {}
    );
  };

  const getJadwal = (item) => {
    if (!item) return {};
    return item.jadwal || item.Jadwal || {};
  };

  const getSkema = (jadwalObj) => {
    if (!jadwalObj) return {};
    return jadwalObj.skema || jadwalObj.Skema || {};
  };

  const filteredData = asesiList.filter((item) => {
    const profile = getAsesiProfile(item.user);
    const jadwalObj = getJadwal(item);
    const skemaObj = getSkema(jadwalObj);

    const nik = profile.nik || "";
    const nama =
      profile.nama_lengkap ||
      item.user?.nama_lengkap ||
      item.user?.email ||
      "";
    const skemaTitle = skemaObj.judul_skema || skemaObj.nama_skema || "";

    return (
      nik.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skemaTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalEntries = filteredData.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, entriesPerPage]);

  const handleDetail = (item) => setSelectedDetail(item);
  const closeDetailModal = () => setSelectedDetail(null);

  const handleLihatJadwal = (item) => setSelectedJadwal(item);
  const closeJadwalModal = () => setSelectedJadwal(null);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[36px] border border-slate-100 bg-white shadow-sm">
          <div className="absolute right-0 top-0 h-[430px] w-[430px] rounded-full bg-red-500/10 blur-[110px]" />
          <div className="absolute -bottom-24 -left-24 h-[380px] w-[380px] rounded-full bg-[#071E3D]/5 blur-[100px]" />

          <div className="relative z-10 grid grid-cols-1 gap-6 p-6 lg:p-8 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="flex flex-col justify-center">
              <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2">
                <ShieldAlert size={15} className="text-red-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-red-500">
                  Data Belum Kompeten
                </span>
              </div>

              <h1 className="text-4xl font-black leading-tight text-[#071E3D] lg:text-5xl">
                Asesi
                <br />
                <span className="text-red-500">Belum Kompeten</span>
              </h1>

              <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-500 lg:text-lg">
                Daftar asesi yang belum lulus uji kompetensi dan
                direkomendasikan belum kompeten berdasarkan hasil asesmen.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-[32px] bg-[#071E3D] p-6 text-white shadow-2xl shadow-[#071E3D]/15">
              <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-red-500/20 blur-3xl" />

              <div className="relative z-10">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-red-300">
                  <Sparkles size={28} />
                </div>

                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/50">
                  Ringkasan Data
                </p>

                <h2 className="mb-4 text-2xl font-black">
                  {asesiList.length} Asesi BK
                </h2>

                <p className="text-sm font-medium leading-relaxed text-white/60">
                  Gunakan pencarian untuk melihat data berdasarkan NIK, nama,
                  atau skema sertifikasi.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <HeroPill label="Status" value="Belum Kompeten" />
                  <HeroPill label="Total" value={`${asesiList.length}`} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <MiniStat
            icon={<BadgeX size={22} />}
            label="Total BK"
            value={`${asesiList.length} Asesi`}
            tone="red"
          />
          <MiniStat
            icon={<ClipboardList size={22} />}
            label="Data Tampil"
            value={`${currentItems.length} Entri`}
            tone="orange"
          />
          <MiniStat
            icon={<UserCheck size={22} />}
            label="Hasil Filter"
            value={`${filteredData.length} Data`}
            tone="navy"
          />
        </section>

        {/* TABLE CARD */}
        <section className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                <Search size={15} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  Filter Data
                </span>
              </div>

              <h2 className="text-2xl font-black text-[#071E3D]">
                Daftar Asesi Belum Kompeten
              </h2>

              <p className="mt-2 text-sm font-medium text-slate-400">
                Cari NIK, nama lengkap, atau skema sertifikasi.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                <span>Show</span>
                <select
                  className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-black text-[#071E3D] outline-none focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
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

              <div className="relative w-full md:w-80">
                <FaSearch
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                  size={13}
                />
                <input
                  type="text"
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-[#071E3D] outline-none placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                  placeholder="Cari NIK / Nama / Skema..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left">
              <thead>
                <tr className="bg-[#071E3D]">
                  <TableHead center>No</TableHead>
                  <TableHead>NIK</TableHead>
                  <TableHead>Nama Lengkap</TableHead>
                  <TableHead>Jadwal / Kegiatan</TableHead>
                  <TableHead>Skema</TableHead>
                  <TableHead center>Nilai</TableHead>
                  <TableHead center>Aksi</TableHead>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="p-12 text-center">
                      <Loader2
                        className="mx-auto mb-4 animate-spin text-orange-500"
                        size={38}
                      />
                      <p className="font-black text-[#071E3D]">
                        Memuat data...
                      </p>
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-12 text-center">
                      <AlertTriangle
                        className="mx-auto mb-4 text-slate-300"
                        size={42}
                      />
                      <p className="font-black text-[#071E3D]">
                        Tidak ada entri yang cocok.
                      </p>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((item, index) => {
                    const profile = getAsesiProfile(item.user);
                    const jadwalObj = getJadwal(item);
                    const skemaObj = getSkema(jadwalObj);

                    return (
                      <tr
                        key={item.id_peserta || index}
                        className="border-b border-slate-100 transition-all last:border-0 hover:bg-red-50/30"
                      >
                        <td className="px-5 py-4 text-center text-sm font-bold text-slate-500">
                          {indexOfFirstItem + index + 1}
                        </td>

                        <td className="px-5 py-4 text-sm font-bold text-slate-600">
                          {profile.nik || "-"}
                        </td>

                        <td className="px-5 py-4 text-sm font-black text-[#071E3D]">
                          {profile.nama_lengkap ||
                            item.user?.nama_lengkap ||
                            item.user?.email ||
                            "-"}
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-slate-500">
                          {jadwalObj.nama_jadwal ||
                            jadwalObj.nama_kegiatan ||
                            "-"}
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-slate-500">
                          {skemaObj.judul_skema ||
                            skemaObj.nama_skema ||
                            "-"}
                        </td>

                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex rounded-full border border-red-100 bg-red-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-600">
                            {item.nilai_akhir || "BK"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex flex-wrap justify-center gap-2">
                            <ActionButton
                              onClick={() => handleDetail(item)}
                              icon={<FaEye />}
                              label="Detail"
                              variant="navy"
                            />
                            <ActionButton
                              onClick={() => handleLihatJadwal(item)}
                              icon={<FaCalendarAlt />}
                              label="Jadwal"
                              variant="blue"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            totalEntries={totalEntries}
            indexOfFirstItem={indexOfFirstItem}
            indexOfLastItem={indexOfLastItem}
            totalPages={totalPages}
            currentPage={currentPage}
            paginate={paginate}
          />
        </section>
      </div>

      {selectedDetail &&
        (() => {
          const profileDetail = getAsesiProfile(selectedDetail.user);

          return (
            <Modal onClose={closeDetailModal} maxWidth="max-w-2xl">
              <ModalHeader
                icon={<FaUserCheck />}
                title="Detail Kelulusan Asesi"
                onClose={closeDetailModal}
                tone="red"
              />

              <div className="p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <ModalInfo label="NIK" value={profileDetail.nik || "-"} />
                  <ModalInfo
                    label="Nama Lengkap"
                    value={
                      profileDetail.nama_lengkap ||
                      selectedDetail.user?.nama_lengkap ||
                      "-"
                    }
                  />
                  <ModalInfo
                    label="Nilai Akhir"
                    value={selectedDetail.nilai_akhir || "-"}
                    valueClass="text-red-600 text-lg"
                  />
                  <div>
                    <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Status Rekomendasi
                    </p>
                    <span className="inline-flex rounded-full border border-red-100 bg-red-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-600">
                      BK - Belum Kompeten
                    </span>
                  </div>
                  <div className="md:col-span-2">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Keterangan / Catatan Asesor
                    </p>
                    <p className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-semibold italic leading-relaxed text-[#071E3D]">
                      {selectedDetail.keterangan ||
                        selectedDetail.catatan ||
                        "Tidak ada catatan."}
                    </p>
                  </div>
                </div>
              </div>

              <ModalFooter onClose={closeDetailModal} />
            </Modal>
          );
        })()}

      {selectedJadwal &&
        (() => {
          const jadwalObj = getJadwal(selectedJadwal);
          const skemaObj = getSkema(jadwalObj);

          return (
            <Modal onClose={closeJadwalModal} maxWidth="max-w-2xl">
              <ModalHeader
                icon={<FaCalendarAlt />}
                title="Detail Jadwal Asesmen"
                onClose={closeJadwalModal}
                tone="blue"
              />

              <div className="p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <ModalInfo
                      label="Nama Kegiatan"
                      value={
                        jadwalObj.nama_jadwal ||
                        jadwalObj.nama_kegiatan ||
                        "-"
                      }
                      valueClass="text-lg"
                    />
                  </div>
                  <ModalInfo
                    label="Skema Sertifikasi"
                    value={skemaObj.judul_skema || skemaObj.nama_skema || "-"}
                  />
                  <ModalInfo
                    label="Metode Pelaksanaan"
                    value={jadwalObj.pelaksanaan_uji || "-"}
                    valueClass="uppercase"
                  />
                  <ModalInfo
                    label="Tanggal Pelaksanaan"
                    value={`${formatDate(jadwalObj.tgl_awal)} s/d ${formatDate(
                      jadwalObj.tgl_akhir
                    )}`}
                  />
                  <ModalInfo
                    label="Waktu / Jam"
                    value={`${jadwalObj.jam || "-"} WIB`}
                  />
                  <div className="md:col-span-2">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Lokasi / URL Agenda
                    </p>
                    {jadwalObj.url_agenda ? (
                      <a
                        href={jadwalObj.url_agenda}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all text-sm font-black text-blue-600 hover:underline"
                      >
                        {jadwalObj.url_agenda}
                      </a>
                    ) : (
                      <p className="text-sm font-black text-[#071E3D]">-</p>
                    )}
                  </div>
                </div>
              </div>

              <ModalFooter onClose={closeJadwalModal} />
            </Modal>
          );
        })()}
    </div>
  );
};

function HeroPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
      <p className="text-[9px] font-black uppercase tracking-widest text-white/40">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function MiniStat({ icon, label, value, tone = "orange" }) {
  const tones = {
    red: "bg-red-50 text-red-500",
    orange: "bg-orange-50 text-orange-500",
    navy: "bg-slate-50 text-[#071E3D]",
  };

  return (
    <div className="flex items-center gap-4 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
      <div
        className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl ${
          tones[tone] || tones.orange
        }`}
      >
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {label}
        </p>
        <p className="mt-1 text-lg font-black text-[#071E3D]">{value}</p>
      </div>
    </div>
  );
}

function TableHead({ children, center }) {
  return (
    <th
      className={`border-b-4 border-orange-500 px-5 py-4 text-[11px] font-black uppercase tracking-widest text-white ${
        center ? "text-center" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function ActionButton({ icon, label, onClick, variant }) {
  const styles = {
    navy: "bg-[#071E3D] text-white hover:bg-orange-500",
    blue: "bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-600 hover:text-white",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black uppercase tracking-widest transition-all ${
        styles[variant] || styles.navy
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function Pagination({
  totalEntries,
  indexOfFirstItem,
  indexOfLastItem,
  totalPages,
  currentPage,
  paginate,
}) {
  return (
    <div className="flex flex-col gap-4 border-t border-slate-100 p-6 text-sm md:flex-row md:items-center md:justify-between">
      <p className="font-semibold text-slate-500">
        Menampilkan {totalEntries === 0 ? 0 : indexOfFirstItem + 1} sampai{" "}
        {Math.min(indexOfLastItem, totalEntries)} dari {totalEntries} entri
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        >
          <ChevronLeft size={14} />
          Prev
        </button>

        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => paginate(index + 1)}
            className={`rounded-xl border px-4 py-2 text-xs font-black transition-all ${
              currentPage === index + 1
                ? "border-orange-500 bg-orange-500 text-white"
                : "border-slate-100 bg-white text-[#071E3D] hover:bg-orange-50"
            }`}
          >
            {index + 1}
          </button>
        ))}

        <button
          type="button"
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        >
          Next
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

function Modal({ children, onClose, maxWidth = "max-w-xl" }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/60 p-4 backdrop-blur-sm">
      <div
        className={`w-full ${maxWidth} overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-2xl`}
      >
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, icon, onClose, tone = "orange" }) {
  const tones = {
    red: "bg-red-50 text-red-500",
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-500",
  };

  return (
    <div className="flex items-center justify-between border-b border-slate-100 p-6">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
            tones[tone] || tones.orange
          }`}
        >
          {icon}
        </div>
        <h2 className="text-xl font-black text-[#071E3D]">{title}</h2>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500"
      >
        <X size={18} />
      </button>
    </div>
  );
}

function ModalInfo({ label, value, valueClass = "" }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p className={`font-black text-[#071E3D] ${valueClass}`}>{value}</p>
    </div>
  );
}

function ModalFooter({ onClose }) {
  return (
    <div className="flex justify-end border-t border-slate-100 bg-slate-50/60 p-5">
      <button
        type="button"
        onClick={onClose}
        className="rounded-2xl border border-slate-100 bg-white px-6 py-3 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
      >
        Tutup
      </button>
    </div>
  );
}

export default AsesiBelumKompeten;