// frontend/src/pages/tuk/ListJadwal.jsx

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  UserCog,
} from "lucide-react";
import SidebarTUK from "../../components/sidebar/SidebarTuk";

const API_BASE = import.meta.env.VITE_API_BASE;
const API = `${API_BASE}/tuk/jadwal`;

const emptySummary = {
  asesor_penguji: { count: 0, names: [] },
  verifikator_tuk: { count: 0, names: [] },
  validator_mkva: { count: 0, names: [] },
  komite_teknis: { count: 0, names: [] },
};

const ListJadwal = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [jadwal, setJadwal] = useState([]);
  const [jenisTuk, setJenisTuk] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const isMandiri = jenisTuk === "mandiri";

  const authHeader = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    [token]
  );

  const getAsesorName = (item) => {
    return (
      item?.nama_lengkap ||
      item?.profileAsesor?.nama_lengkap ||
      item?.asesor?.username ||
      item?.user?.username ||
      "-"
    );
  };

  const fetchProfileTuk = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/tuk/profile`, authHeader);
      const jenis = res.data?.data?.tuk?.jenis_tuk || "";
      setJenisTuk(jenis);
    } catch (err) {
      console.error("Gagal mengambil profil TUK:", err);
    }
  }, [authHeader]);

  const fetchAsesorByJenis = useCallback(
    async (idJadwal, jenisTugas) => {
      try {
        const res = await axios.get(
          `${API}/${idJadwal}/asesor/${jenisTugas}`,
          authHeader
        );

        const data = res.data?.data || [];

        return {
          count: data.length,
          names: data.map((a) => getAsesorName(a)).filter(Boolean).slice(0, 2),
        };
      } catch (err) {
        console.warn(`Gagal fetch ${jenisTugas} jadwal ${idJadwal}:`, err);
        return { count: 0, names: [] };
      }
    },
    [authHeader]
  );

  const fetchJadwal = useCallback(async () => {
    try {
      setLoading(true);

      const res = await axios.get(API, authHeader);
      const jadwalList = res.data?.data || [];

      if (!jenisTuk && res.data?.jenis_tuk) {
        setJenisTuk(res.data.jenis_tuk);
      }

      const jadwalWithAsesor = await Promise.all(
        jadwalList.map(async (item) => {
          if (
            item.status === "draft" ||
            item.status === "ditolak" ||
            jenisTuk !== "mandiri"
          ) {
            return {
              ...item,
              asesorSummary: emptySummary,
            };
          }

          const [penguji, verifTuk, mkva, komiteTeknis] = await Promise.all([
            fetchAsesorByJenis(item.id_jadwal, "asesor_penguji"),
            fetchAsesorByJenis(item.id_jadwal, "verifikator_tuk"),
            fetchAsesorByJenis(item.id_jadwal, "validator_mkva"),
            fetchAsesorByJenis(item.id_jadwal, "komite_teknis"),
          ]);

          return {
            ...item,
            asesorSummary: {
              asesor_penguji: penguji,
              verifikator_tuk: verifTuk,
              validator_mkva: mkva,
              komite_teknis: komiteTeknis,
            },
          };
        })
      );

      setJadwal(jadwalWithAsesor);
    } catch (err) {
      console.error("Gagal mengambil jadwal:", err);
      setJadwal([]);
    } finally {
      setLoading(false);
    }
  }, [authHeader, jenisTuk, fetchAsesorByJenis]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchProfileTuk();
  }, [token, navigate, fetchProfileTuk]);

  useEffect(() => {
    if (!token) return;
    fetchJadwal();
  }, [token, fetchJadwal]);

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);

      await axios.delete(`${API}/${deleteId}`, authHeader);

      setShowModal(false);
      setDeleteId(null);
      await fetchJadwal();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus jadwal");
    } finally {
      setDeleting(false);
    }
  };

  const filteredJadwal = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return jadwal;

    return jadwal.filter((j) => {
      return (
        j.nama_kegiatan?.toLowerCase().includes(keyword) ||
        j.kode_jadwal?.toLowerCase().includes(keyword) ||
        j.skema?.judul_skema?.toLowerCase().includes(keyword) ||
        j.skema?.kode_skema?.toLowerCase().includes(keyword)
      );
    });
  }, [jadwal, search]);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const label = {
      draft: "Draft",
      disetujui: "Disetujui",
      ditolak: "Ditolak",
      open: "Open",
      ongoing: "Ongoing",
      selesai: "Selesai",
      arsip: "Arsip",
    };

    const statusClass = {
      draft: "bg-orange-50 text-orange-600 border-orange-100",
      ditolak: "bg-red-50 text-red-600 border-red-100",
      disetujui: "bg-slate-50 text-[#071E3D] border-slate-100",
      open: "bg-slate-50 text-[#071E3D] border-slate-100",
      ongoing: "bg-slate-50 text-[#071E3D] border-slate-100",
      selesai: "bg-slate-50 text-[#071E3D] border-slate-100",
      arsip: "bg-slate-50 text-slate-500 border-slate-100",
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${
          statusClass[status] || statusClass.arsip
        }`}
      >
        {label[status] || "Arsip"}
      </span>
    );
  };

  const getTotalAsesor = (summary = {}) => {
    return Object.values(summary).reduce(
      (sum, data) => sum + (data?.count || 0),
      0
    );
  };

  const renderAsesorSummary = (summary = {}) => {
    const total = getTotalAsesor(summary);

    if (total === 0) {
      return (
        <div className="rounded-[20px] bg-slate-50 border border-slate-100 p-4 h-full">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">
            Asesor
          </p>

          <div className="flex items-center gap-2 text-slate-400 text-sm font-black">
            <Inbox size={16} />
            Belum ada asesor
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-[20px] bg-slate-50 border border-slate-100 p-4 h-full">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">
          Asesor
        </p>

        <div className="flex items-center gap-2 text-[#071E3D] text-sm font-black mb-3">
          <Users size={16} className="text-orange-500" />
          {total} Asesor
        </div>

        <div className="space-y-2">
          <AsesorItem
            label="Penguji"
            count={summary.asesor_penguji?.count || 0}
          />
          <AsesorItem
            label="Verif TUK"
            count={summary.verifikator_tuk?.count || 0}
          />
          <AsesorItem
            label="MKVA"
            count={summary.validator_mkva?.count || 0}
          />
          <AsesorItem
            label="Komite Teknis"
            count={summary.komite_teknis?.count || 0}
          />
        </div>
      </div>
    );
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex overflow-x-hidden">
      <SidebarTUK
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onLogout={handleLogout}
        handleLogout={handleLogout}
      />

      <main className="flex-1 transition-all duration-300 p-4 lg:p-8 w-full">
        <div className="max-w-7xl mx-auto">
          <section className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 lg:p-8 mb-6 relative overflow-hidden">
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

                <p className="text-slate-500 mt-3 max-w-3xl font-medium leading-relaxed">
                  {isMandiri
                    ? "Kelola jadwal asesmen kompetensi, asesor penguji, verifikator TUK, validator MKVA, dan komite teknis."
                    : "Lihat jadwal uji kompetensi yang telah dibuat dan dikelola oleh admin."}
                </p>
              </div>

              {isMandiri && (
                <button
                  type="button"
                  onClick={() => navigate("/tuk/jadwal/buat")}
                  className="w-full sm:w-fit px-6 py-4 rounded-2xl bg-orange-500 hover:bg-[#071E3D] text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={19} />
                  Buat Jadwal Baru
                </button>
              )}
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            <div className="lg:col-span-3 bg-white rounded-[26px] border border-slate-100 shadow-sm p-4">
              <div className="relative">
                <Search
                  size={20}
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  placeholder="Cari nama kegiatan, kode jadwal, skema, atau kode skema..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 text-[#071E3D] font-bold transition-all"
                />
              </div>
            </div>

            <div className="bg-white rounded-[26px] p-5 border border-slate-100 shadow-sm">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                Total Jadwal
              </p>
              <div className="flex items-end justify-between mt-2">
                <h2 className="text-3xl font-black text-[#071E3D]">
                  {jadwal.length}
                </h2>
                <Calendar className="text-orange-500" size={28} />
              </div>
            </div>
          </section>

          {loading ? (
            <div className="bg-white rounded-[32px] border border-slate-100 p-16 text-center">
              <Loader2
                className="animate-spin mx-auto text-orange-500 mb-4"
                size={42}
              />
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

              {isMandiri && (
                <button
                  type="button"
                  onClick={() => navigate("/tuk/jadwal/buat")}
                  className="px-6 py-3 rounded-2xl bg-orange-500 hover:bg-[#071E3D] text-white font-black text-xs uppercase tracking-widest transition-all"
                >
                  Buat Jadwal
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJadwal.map((item) => {
                const canManage =
                  isMandiri &&
                  item.status !== "draft" &&
                  item.status !== "ditolak";

                return (
                  <article
                    key={item.id_jadwal}
                    className="bg-white rounded-[30px] border border-slate-100 shadow-sm hover:shadow-[0_20px_50px_-30px_rgba(7,30,61,0.35)] transition-all overflow-hidden"
                  >
                    <div className="p-5 lg:p-6">
                      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
                        <div className="min-w-0">
                          <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                              <Calendar size={26} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                {getStatusBadge(item.status)}

                                {item.kode_jadwal && (
                                  <span className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                    {item.kode_jadwal}
                                  </span>
                                )}
                              </div>

                              <h2 className="text-xl lg:text-2xl font-black text-[#071E3D] leading-tight">
                                {item.nama_kegiatan || "-"}
                              </h2>

                              <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-slate-500 font-medium">
                                <span className="inline-flex items-center gap-2">
                                  <Clock
                                    size={16}
                                    className="text-orange-500"
                                  />
                                  {formatDate(item.tgl_awal)} -{" "}
                                  {formatDate(item.tgl_akhir)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <InfoCard label="Skema Sertifikasi">
                              <p className="text-sm font-black text-[#071E3D] leading-snug">
                                {item.skema?.judul_skema || "-"}
                              </p>

                              {item.skema?.kode_skema && (
                                <p className="text-[11px] text-slate-400 font-bold mt-2 uppercase tracking-wide">
                                  {item.skema.kode_skema}
                                </p>
                              )}
                            </InfoCard>

                            {renderAsesorSummary(item.asesorSummary || {})}
                          </div>
                        </div>

                        <div className="shrink-0">
                          {!isMandiri ? (
                            <InfoNotice
                              icon={<ShieldCheck size={22} />}
                              title="Mode Lihat Saja"
                              desc="Jadwal dari Admin"
                            />
                          ) : item.status === "draft" ? (
                            <div className="space-y-2">
                              <ActionButton
                                onClick={() =>
                                  navigate(
                                    `/tuk/jadwal/${item.id_jadwal}/edit`
                                  )
                                }
                                icon={<Pencil size={15} />}
                                label="Edit Draft"
                              />

                              <ActionButton
                                onClick={() =>
                                  handleDeleteClick(item.id_jadwal)
                                }
                                icon={<Trash2 size={15} />}
                                label="Hapus Draft"
                              />

                              <InfoNotice
                                icon={<AlertTriangle size={22} />}
                                title="Menunggu Persetujuan"
                                desc="Belum Diverifikasi Admin"
                              />
                            </div>
                          ) : item.status === "ditolak" ? (
                            <InfoNotice
                              icon={<AlertTriangle size={22} />}
                              title="Jadwal Ditolak"
                              desc="Tidak dapat dikelola"
                              danger
                            />
                          ) : (
                            <div className="space-y-2">
                              <ActionButton
                                onClick={() =>
                                  navigate(
                                    `/tuk/jadwal/${item.id_jadwal}/asesor`
                                  )
                                }
                                icon={<UserCheck size={15} />}
                                label="Penguji"
                              />

                              <ActionButton
                                onClick={() =>
                                  navigate(
                                    `/tuk/jadwal/${item.id_jadwal}/verifikasi`
                                  )
                                }
                                icon={<CheckCircle size={15} />}
                                label="Verif TUK"
                              />

                              <ActionButton
                                onClick={() =>
                                  navigate(
                                    `/tuk/jadwal/${item.id_jadwal}/validator`
                                  )
                                }
                                icon={<FileCheck size={15} />}
                                label="MKVA"
                              />

                              <ActionButton
                                onClick={() =>
                                  navigate(
                                    `/tuk/jadwal/${item.id_jadwal}/komite-teknis`
                                  )
                                }
                                icon={<UserCog size={15} />}
                                label="Komite Teknis"
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
                        type="button"
                        onClick={() =>
                          canManage
                            ? navigate(`/tuk/jadwal/${item.id_jadwal}/asesor`)
                            : null
                        }
                        disabled={!canManage}
                        className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest transition-all ${
                          canManage
                            ? "text-orange-500 hover:text-[#071E3D]"
                            : "text-slate-300 cursor-not-allowed"
                        }`}
                      >
                        Kelola Detail
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {!loading && (
            <div className="mt-6 text-right text-sm text-slate-400 font-bold">
              Menampilkan{" "}
              <span className="text-[#071E3D]">{filteredJadwal.length}</span>{" "}
              dari <span className="text-[#071E3D]">{jadwal.length}</span>{" "}
              jadwal
            </div>
          )}
        </div>
      </main>

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
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setDeleteId(null);
                }}
                className="px-6 py-3 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors font-black text-[#071E3D] text-xs uppercase tracking-widest"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {deleting && <Loader2 size={16} className="animate-spin" />}
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
    <div className="rounded-[20px] bg-slate-50 border border-slate-100 p-4 h-full">
      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">
        {label}
      </p>

      {children}
    </div>
  );
};

const ActionButton = ({ onClick, icon, label, disabled = false }) => {
  const buttonClass =
    "bg-[#071E3D] hover:bg-orange-500 text-white border border-[#071E3D]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full min-h-[52px] px-3 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm ${
        disabled
          ? "bg-slate-100 text-slate-300 border border-slate-100 cursor-not-allowed"
          : buttonClass
      }`}
    >
      <span className="shrink-0">{icon}</span>
      <span className="leading-tight text-center">{label}</span>
    </button>
  );
};

const InfoNotice = ({ icon, title, desc, danger = false }) => {
  return (
    <div
      className={`rounded-[22px] p-5 text-center border ${
        danger
          ? "bg-red-50 border-red-100"
          : "bg-slate-50 border-slate-100"
      }`}
    >
      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 border border-slate-100 text-orange-500">
        {icon}
      </div>

      <p className="text-sm font-black text-[#071E3D]">{title}</p>

      <p
        className={`text-[10px] font-black uppercase tracking-widest mt-1 ${
          danger ? "text-red-500" : "text-slate-400"
        }`}
      >
        {desc}
      </p>
    </div>
  );
};

const AsesorItem = ({ label, count }) => {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white border border-slate-100 px-3 py-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate">
        {label}
      </span>
      <span className="text-xs font-black text-[#071E3D] shrink-0">
        {count}
      </span>
    </div>
  );
};

export default ListJadwal;