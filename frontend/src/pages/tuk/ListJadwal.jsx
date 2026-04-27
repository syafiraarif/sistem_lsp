// frontend/src/pages/tuk/ListJadwal.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Calendar,
  Plus,
  Search,
  Users,
  Clock,
  Trash2,
  Pencil,
  UserCheck,
  ShieldCheck,
  CheckCircle,
  FileCheck,
  AlertTriangle,
  Loader2,
  Inbox,
  ChevronRight,
  ClipboardList,
} from "lucide-react";
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

  const fetchJadwal = async () => {
    try {
      setLoading(true);

      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const jadwalList = res.data?.data || [];

      const jadwalWithAsesor = await Promise.all(
        jadwalList.map(async (item) => {
          if (item.status === "draft") {
            return {
              ...item,
              asesorSummary: {
                asesor_penguji: { count: 0, names: [] },
                verifikator_tuk: { count: 0, names: [] },
                validator_mkva: { count: 0, names: [] },
              },
            };
          }

          try {
            const [pengujiRes, verifRes, mkvaRes] = await Promise.all([
              axios.get(`${API}/${item.id_jadwal}/asesor/asesor_penguji`, {
                headers: { Authorization: `Bearer ${token}` },
              }),
              axios.get(`${API}/${item.id_jadwal}/asesor/verifikator_tuk`, {
                headers: { Authorization: `Bearer ${token}` },
              }),
              axios.get(`${API}/${item.id_jadwal}/asesor/validator_mkva`, {
                headers: { Authorization: `Bearer ${token}` },
              }),
            ]);

            return {
              ...item,
              asesorSummary: {
                asesor_penguji: {
                  count: pengujiRes.data.data?.length || 0,
                  names:
                    pengujiRes.data.data
                      ?.map((a) => a.nama_lengkap)
                      .slice(0, 2) || [],
                },
                verifikator_tuk: {
                  count: verifRes.data.data?.length || 0,
                  names:
                    verifRes.data.data
                      ?.map((a) => a.nama_lengkap)
                      .slice(0, 2) || [],
                },
                validator_mkva: {
                  count: mkvaRes.data.data?.length || 0,
                  names:
                    mkvaRes.data.data
                      ?.map((a) => a.nama_lengkap)
                      .slice(0, 2) || [],
                },
              },
            };
          } catch (err) {
            console.warn(`Gagal fetch asesor untuk jadwal ${item.id_jadwal}:`, err);

            return {
              ...item,
              asesorSummary: {
                asesor_penguji: { count: 0, names: [] },
                verifikator_tuk: { count: 0, names: [] },
                validator_mkva: { count: 0, names: [] },
              },
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

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowModal(true);
  };

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
      alert(err.response?.data?.message || "Gagal menghapus jadwal");
    } finally {
      setDeleting(false);
    }
  };

  const filteredJadwal = jadwal.filter((j) => {
    const keyword = search.toLowerCase();

    return (
      j.nama_kegiatan?.toLowerCase().includes(keyword) ||
      j.kode_jadwal?.toLowerCase().includes(keyword) ||
      j.skema?.judul_skema?.toLowerCase().includes(keyword)
    );
  });

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const map = {
      draft: "bg-orange-50 text-orange-600 border-orange-100",
      open: "bg-emerald-50 text-emerald-600 border-emerald-100",
      ongoing: "bg-blue-50 text-blue-600 border-blue-100",
      selesai: "bg-purple-50 text-purple-600 border-purple-100",
      arsip: "bg-slate-50 text-slate-500 border-slate-100",
    };

    const label = {
      draft: "Draft",
      open: "Open",
      ongoing: "Ongoing",
      selesai: "Selesai",
      arsip: "Arsip",
    };

    return (
      <span
        className={`px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${
          map[status] || map.arsip
        }`}
      >
        {label[status] || "Arsip"}
      </span>
    );
  };

  const getTotalAsesor = (summary = {}) => {
    return Object.values(summary).reduce((sum, data) => sum + (data?.count || 0), 0);
  };

  const renderAsesorSummary = (summary = {}) => {
    const total = getTotalAsesor(summary);

    if (total === 0) {
      return (
        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
          <Users size={14} />
          Belum ada asesor
        </div>
      );
    }

    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-[#071E3D] text-sm font-black">
          <Users size={15} className="text-orange-500" />
          {total} Asesor
        </div>

        <div className="space-y-1 text-xs text-slate-500">
          {summary.asesor_penguji?.count > 0 && (
            <AsesorItem
              label={`${summary.asesor_penguji.count} Penguji`}
              names={summary.asesor_penguji.names}
              extra={summary.asesor_penguji.count - 2}
              color="text-orange-500"
            />
          )}

          {summary.verifikator_tuk?.count > 0 && (
            <AsesorItem
              label={`${summary.verifikator_tuk.count} Verif`}
              names={summary.verifikator_tuk.names}
              extra={summary.verifikator_tuk.count - 2}
              color="text-emerald-600"
            />
          )}

          {summary.validator_mkva?.count > 0 && (
            <AsesorItem
              label={`${summary.validator_mkva.count} MKVA`}
              names={summary.validator_mkva.names}
              extra={summary.validator_mkva.count - 2}
              color="text-purple-600"
            />
          )}
        </div>
      </div>
    );
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <SidebarTUK
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      <main className="flex-1 transition-all duration-300 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 lg:p-8 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-orange-500/10 rounded-full blur-[90px] pointer-events-none" />

            <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 mb-4">
                  <ClipboardList size={15} className="text-orange-500" />
                  <span className="text-orange-500 text-[10px] font-black uppercase tracking-widest">
                    Manajemen Jadwal TUK
                  </span>
                </div>

                <h1 className="text-3xl lg:text-4xl font-black text-[#071E3D] leading-tight">
                  Daftar Jadwal Sertifikasi
                </h1>

                <p className="text-slate-500 mt-3 max-w-2xl font-medium leading-relaxed">
                  Kelola jadwal asesmen kompetensi, status persetujuan,
                  asesor penguji, verifikator TUK, dan validator MKVA.
                </p>
              </div>

              <button
                onClick={() => navigate("/tuk/jadwal/buat")}
                className="w-full sm:w-fit px-6 py-4 rounded-2xl bg-orange-500 hover:bg-[#071E3D] text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={19} />
                Buat Jadwal Baru
              </button>
            </div>
          </div>

          {/* Search + Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            <div className="lg:col-span-3 bg-white rounded-[26px] border border-slate-100 shadow-sm p-4">
              <div className="relative">
                <Search
                  size={20}
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  placeholder="Cari nama kegiatan, kode jadwal, atau skema..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 text-[#071E3D] font-bold transition-all"
                />
              </div>
            </div>

            <div className="bg-[#071E3D] rounded-[26px] p-5 text-white shadow-sm">
              <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">
                Total Jadwal
              </p>
              <div className="flex items-end justify-between mt-2">
                <h2 className="text-3xl font-black">{jadwal.length}</h2>
                <Calendar className="text-orange-400" size={28} />
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="bg-white rounded-[32px] border border-slate-100 p-16 text-center">
              <Loader2 className="animate-spin mx-auto text-orange-500 mb-4" size={42} />
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest">
                Memuat Data Jadwal...
              </p>
            </div>
          ) : filteredJadwal.length === 0 ? (
            <div className="bg-white rounded-[32px] border border-slate-100 p-16 text-center">
              <div className="w-20 h-20 rounded-[28px] bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-5">
                <Inbox className="text-slate-300" size={38} />
              </div>

              <h3 className="text-xl font-black text-[#071E3D] mb-2">
                Jadwal tidak ditemukan
              </h3>

              <p className="text-slate-500 font-medium mb-6">
                Belum ada jadwal, atau kata kunci pencarian tidak cocok.
              </p>

              <button
                onClick={() => navigate("/tuk/jadwal/buat")}
                className="px-6 py-3 rounded-2xl bg-orange-500 hover:bg-[#071E3D] text-white font-black text-xs uppercase tracking-widest transition-all"
              >
                Buat Jadwal
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJadwal.map((item) => (
                <div
                  key={item.id_jadwal}
                  className="bg-white rounded-[30px] border border-slate-100 shadow-sm hover:shadow-[0_20px_50px_-30px_rgba(7,30,61,0.35)] transition-all overflow-hidden"
                >
                  <div className="p-5 lg:p-6">
                    <div className="flex flex-col xl:flex-row xl:items-start gap-6">
                      {/* Main Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                              <Calendar size={26} />
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                {getStatusBadge(item.status)}

                                {item.kode_jadwal && (
                                  <span className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                    {item.kode_jadwal}
                                  </span>
                                )}
                              </div>

                              <h2 className="text-xl lg:text-2xl font-black text-[#071E3D] leading-tight">
                                {item.nama_kegiatan}
                              </h2>

                              <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-slate-500 font-medium">
                                <span className="inline-flex items-center gap-2">
                                  <Clock size={16} className="text-orange-500" />
                                  {formatDate(item.tgl_awal)} - {formatDate(item.tgl_akhir)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                          <InfoCard label="Skema Sertifikasi">
                            <p className="text-sm font-black text-[#071E3D] leading-snug">
                              {item.skema?.judul_skema || "-"}
                            </p>

                            {item.skema?.kode_skema && (
                              <p className="text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-wide">
                                {item.skema.kode_skema}
                              </p>
                            )}
                          </InfoCard>

                          <InfoCard label="Kuota">
                            <div className="flex items-center gap-2">
                              <Users size={18} className="text-orange-500" />
                              <p className="text-lg font-black text-[#071E3D]">
                                {item.kuota || 0}{" "}
                                <span className="text-xs text-slate-400 font-bold">
                                  orang
                                </span>
                              </p>
                            </div>
                          </InfoCard>

                          <InfoCard label="Asesor">
                            {renderAsesorSummary(item.asesorSummary || {})}
                          </InfoCard>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="xl:w-[260px] shrink-0">
                        {item.status === "draft" ? (
                          <div className="rounded-[24px] bg-orange-50 border border-orange-100 p-5 text-center">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                              <AlertTriangle className="text-orange-500" size={22} />
                            </div>

                            <p className="text-sm font-black text-[#071E3D]">
                              Menunggu Persetujuan
                            </p>

                            <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest mt-1">
                              Belum di-acc Admin
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 xl:grid-cols-1 gap-2">
                            <ActionButton
                              onClick={() =>
                                navigate(`/tuk/jadwal/${item.id_jadwal}/edit`)
                              }
                              icon={<Pencil size={15} />}
                              label="Edit Jadwal"
                              className="bg-orange-500 hover:bg-orange-600 text-white"
                            />

                            <ActionButton
                              onClick={() => handleDeleteClick(item.id_jadwal)}
                              icon={<Trash2 size={15} />}
                              label="Hapus"
                              className="bg-red-500 hover:bg-red-600 text-white"
                            />

                            <ActionButton
                              onClick={() =>
                                navigate(`/tuk/jadwal/${item.id_jadwal}/asesor`)
                              }
                              icon={<UserCheck size={15} />}
                              label="Penguji"
                              className="bg-[#071E3D] hover:bg-[#0B2A55] text-white"
                            />

                            <ActionButton
                              onClick={() =>
                                navigate(`/tuk/jadwal/${item.id_jadwal}/verifikasi`)
                              }
                              icon={<CheckCircle size={15} />}
                              label="Verif TUK"
                              className="bg-emerald-500 hover:bg-emerald-600 text-white"
                            />

                            <ActionButton
                              onClick={() =>
                                navigate(`/tuk/jadwal/${item.id_jadwal}/validator`)
                              }
                              icon={<FileCheck size={15} />}
                              label="MKVA"
                              className="bg-purple-600 hover:bg-purple-700 text-white col-span-2 xl:col-span-1"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="px-5 lg:px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                      ID Jadwal: {item.id_jadwal}
                    </span>

                    <button
                      onClick={() =>
                        item.status === "draft"
                          ? null
                          : navigate(`/tuk/jadwal/${item.id_jadwal}/asesor`)
                      }
                      disabled={item.status === "draft"}
                      className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest transition-all ${
                        item.status === "draft"
                          ? "text-slate-300 cursor-not-allowed"
                          : "text-orange-500 hover:text-[#071E3D]"
                      }`}
                    >
                      Kelola Detail
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && (
            <div className="mt-6 text-right text-sm text-slate-400 font-bold">
              Menampilkan{" "}
              <span className="text-[#071E3D]">{filteredJadwal.length}</span>{" "}
              dari <span className="text-[#071E3D]">{jadwal.length}</span> jadwal
            </div>
          )}
        </div>
      </main>

      {/* Modal Delete */}
      {showModal && (
        <div className="fixed inset-0 bg-[#071E3D]/60 backdrop-blur-sm flex items-center justify-center z-[90] p-4">
          <div className="bg-white rounded-[30px] p-8 w-full max-w-md shadow-2xl border border-slate-100">
            <div className="text-center mb-7">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
                <Trash2 className="text-red-500" size={28} />
              </div>

              <h2 className="text-2xl font-black text-[#071E3D] mb-2">
                Konfirmasi Penghapusan
              </h2>

              <p className="text-slate-500 leading-relaxed">
                Apakah Anda yakin ingin menghapus jadwal ini?
                <br />
                <strong className="text-red-500">
                  Data akan hilang permanen.
                </strong>
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowModal(false);
                  setDeleteId(null);
                }}
                className="px-6 py-3 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors font-black text-[#071E3D] text-xs uppercase tracking-widest"
              >
                Batal
              </button>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all"
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

const InfoCard = ({ label, children }) => {
  return (
    <div className="rounded-[22px] bg-slate-50 border border-slate-100 p-4">
      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">
        {label}
      </p>

      {children}
    </div>
  );
};

const ActionButton = ({ onClick, icon, label, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm ${className}`}
    >
      {icon}
      {label}
    </button>
  );
};

const AsesorItem = ({ label, names, extra, color }) => {
  return (
    <div className="leading-snug">
      <span className={`font-black ${color}`}>{label}: </span>
      <span className="font-medium">
        {names?.join(", ")}
        {extra > 0 && ` +${extra}`}
      </span>
    </div>
  );
};

export default ListJadwal;