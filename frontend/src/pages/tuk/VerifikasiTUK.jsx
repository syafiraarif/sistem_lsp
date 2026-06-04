// frontend/src/pages/tuk/VerifikasiTUK.jsx

import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import SidebarTUK from "../../components/sidebar/SidebarTuk";
import {
  ArrowLeft,
  Award,
  Calendar,
  CheckCircle,
  ChevronRight,
  ClipboardList,
  Hash,
  Inbox,
  Loader2,
  Phone,
  Search,
  ShieldCheck,
  Trash2,
  User,
  UserCheck,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";

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
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const authHeader = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    [token]
  );

  const getActiveId = (item) => {
    return (
      item?.id_user ||
      item?.asesor?.id_user ||
      item?.profileAsesor?.id_user ||
      item?.id_asesor
    );
  };

  const normalizeActiveAsesor = (item) => {
    const profile = item?.profileAsesor || item || {};
    const user = item?.asesor || item?.user || {};

    return {
      id_user: getActiveId(item),
      nama_lengkap:
        profile?.nama_lengkap ||
        item?.nama_lengkap ||
        user?.nama_lengkap ||
        user?.username ||
        "-",
      bidang_keahlian:
        profile?.bidang_keahlian || item?.bidang_keahlian || "-",
      no_reg_asesor:
        profile?.no_reg_asesor || item?.no_reg_asesor || "-",
      no_lisensi:
        profile?.no_lisensi || item?.no_lisensi || "-",
      username: user?.username || item?.username || "-",
      no_hp: user?.no_hp || item?.no_hp || profile?.no_hp || "-",
    };
  };

  const normalizeAvailableAsesor = (item) => {
    const user = item?.user || item?.asesor || {};

    return {
      id_user: item?.id_user || user?.id_user || item?.id_asesor,
      nama_lengkap:
        item?.nama_lengkap ||
        user?.nama_lengkap ||
        user?.username ||
        "-",
      bidang_keahlian: item?.bidang_keahlian || "-",
      no_reg_asesor: item?.no_reg_asesor || "-",
      no_lisensi: item?.no_lisensi || "-",
      username: user?.username || item?.username || "-",
      no_hp: user?.no_hp || item?.no_hp || "-",
    };
  };

  const activeAsesor = useMemo(() => {
    return asesorJadwal
      .map(normalizeActiveAsesor)
      .filter((item) => item.id_user);
  }, [asesorJadwal]);

  const activeIds = useMemo(() => {
    return activeAsesor.map((item) => Number(item.id_user));
  }, [activeAsesor]);

  const availableAsesor = useMemo(() => {
    return allAsesor
      .map(normalizeAvailableAsesor)
      .filter((item) => item.id_user)
      .filter((item) => !activeIds.includes(Number(item.id_user)));
  }, [allAsesor, activeIds]);

  const filteredAsesor = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return availableAsesor;

    return availableAsesor.filter((a) => {
      return (
        a.nama_lengkap?.toLowerCase().includes(keyword) ||
        a.no_reg_asesor?.toLowerCase().includes(keyword) ||
        a.username?.toLowerCase().includes(keyword) ||
        a.no_hp?.toLowerCase().includes(keyword) ||
        a.bidang_keahlian?.toLowerCase().includes(keyword)
      );
    });
  }, [availableAsesor, search]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [resJadwal, resAsesorJadwal, resAllAsesor] = await Promise.all([
        axios.get(`${API_BASE}/tuk/jadwal/${id}`, authHeader),
        axios.get(
          `${API_BASE}/tuk/jadwal/${id}/asesor/verifikator_tuk`,
          authHeader
        ),
        axios.get(`${API_BASE}/tuk/asesor`, authHeader),
      ]);

      setJadwal(resJadwal.data?.data || null);
      setAsesorJadwal(resAsesorJadwal.data?.data || []);
      setAllAsesor(resAllAsesor.data?.data || []);
    } catch (err) {
      console.error("Error fetch verifikasi TUK:", err);

      if (err.response?.status === 401) {
        alert("Session habis, silakan login kembali");
        localStorage.clear();
        navigate("/login");
        return;
      }

      alert(err?.response?.data?.message || "Gagal memuat data verifikasi TUK");
    } finally {
      setLoading(false);
    }
  }, [id, navigate, authHeader]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (id) fetchData();
  }, [id, token, navigate, fetchData]);

  const handleAdd = (id_user) => {
    const parsedId = Number(id_user);

    setSelected((prev) => {
      if (prev.includes(parsedId)) return prev;
      return [...prev, parsedId];
    });
  };

  const handleRemove = (id_user) => {
    const parsedId = Number(id_user);
    setSelected((prev) => prev.filter((item) => item !== parsedId));
  };

  const handleSave = async () => {
    if (selected.length === 0) {
      alert("Pilih minimal 1 verifikator dulu");
      return;
    }

    const mergedIds = [...new Set([...activeIds, ...selected])];

    try {
      setSaving(true);

      const payload = {
        listAsesor: mergedIds.map((id_user) => ({
          id_user: Number(id_user),
        })),
      };

      await axios.post(
        `${API_BASE}/tuk/jadwal/${id}/asesor/verifikator_tuk`,
        payload,
        authHeader
      );

      setSelected([]);
      await fetchData();
      alert("Verifikator TUK berhasil disimpan");
    } catch (err) {
      console.error("Error save verifikasi TUK:", err);
      alert(err?.response?.data?.message || "Gagal menyimpan verifikator");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAsesor = async (id_user, nama = "verifikator ini") => {
    if (!window.confirm(`Hapus ${nama} dari verifikasi TUK?`)) return;

    try {
      await axios.delete(
        `${API_BASE}/tuk/jadwal/${id}/asesor/verifikator_tuk/${id_user}`,
        authHeader
      );

      setSelected((prev) => prev.filter((item) => item !== Number(id_user)));
      await fetchData();
      alert("Verifikator berhasil dihapus");
    } catch (err) {
      console.error("Error delete verifikasi TUK:", err);
      alert(err?.response?.data?.message || "Gagal menghapus verifikator");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex">
        <SidebarTUK
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          onLogout={handleLogout}
          handleLogout={handleLogout}
        />

        <main className="flex-1 p-6 lg:p-10 flex items-center justify-center">
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-10 text-center">
            <Loader2
              className="animate-spin text-orange-500 mx-auto mb-5"
              size={44}
            />
            <p className="text-[#071E3D] font-black text-lg">
              Memuat Verifikasi TUK
            </p>
            <p className="text-slate-400 text-sm mt-1 font-medium">
              Mohon tunggu sebentar...
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex overflow-x-hidden">
      <SidebarTUK
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onLogout={handleLogout}
        handleLogout={handleLogout}
      />

      <main className="flex-1 w-full p-4 md:p-6 lg:p-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          <section className="relative overflow-hidden bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 lg:p-8 mb-6">
            <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-[90px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#071E3D]/5 rounded-full blur-[90px] pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="mb-5 inline-flex items-center gap-2 text-slate-400 hover:text-orange-500 font-black text-xs uppercase tracking-widest transition-colors"
                >
                  <ArrowLeft size={17} />
                  Kembali
                </button>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 mb-4">
                  <ShieldCheck size={15} className="text-orange-500" />
                  <span className="text-orange-500 text-[10px] font-black uppercase tracking-widest">
                    Kelola Verifikasi TUK
                  </span>
                </div>

                <h1 className="text-3xl lg:text-4xl font-black text-[#071E3D] leading-tight">
                  Verifikasi TUK
                </h1>

                <p className="text-slate-500 mt-3 max-w-2xl font-medium leading-relaxed">
                  Pilih asesor yang bertugas sebagai verifikator TUK untuk
                  jadwal{" "}
                  <span className="font-black text-[#071E3D]">
                    {jadwal?.nama_kegiatan || "-"}
                  </span>
                  .
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 w-full lg:w-auto lg:min-w-[460px]">
                <TopStat
                  label="Aktif"
                  value={activeAsesor.length}
                  icon={<UserCheck size={21} />}
                />
                <TopStat
                  label="Tersedia"
                  value={availableAsesor.length}
                  icon={<UserPlus size={21} />}
                />
                <TopStat
                  label="Dipilih"
                  value={selected.length}
                  icon={<CheckCircle size={21} />}
                  highlight
                />
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6 items-start">
            <section className="space-y-6">
              <Card title="Informasi Jadwal" icon={<ClipboardList size={22} />}>
                {jadwal ? (
                  <div className="space-y-4">
                    <InfoBox label="Kegiatan">
                      <p className="text-[#071E3D] font-black leading-snug">
                        {jadwal?.nama_kegiatan || "-"}
                      </p>
                    </InfoBox>

                    <InfoBox label="Tanggal">
                      <div className="flex items-center gap-2 text-[#071E3D] font-black">
                        <Calendar size={17} className="text-orange-500" />
                        <span>
                          {formatDate(jadwal?.tgl_awal)} -{" "}
                          {formatDate(jadwal?.tgl_akhir)}
                        </span>
                      </div>
                    </InfoBox>
                  </div>
                ) : (
                  <EmptyState
                    icon={<Inbox size={34} />}
                    title="Jadwal tidak ditemukan"
                    desc="Data jadwal tidak tersedia."
                  />
                )}
              </Card>

              <Card
                title="Verifikator Aktif"
                icon={<ShieldCheck size={22} />}
                rightBadge={activeAsesor.length}
              >
                {activeAsesor.length === 0 ? (
                  <EmptyState
                    icon={<Inbox size={34} />}
                    title="Belum ada verifikator"
                    desc="Tambahkan asesor verifikasi TUK untuk jadwal ini."
                  />
                ) : (
                  <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                    {activeAsesor.map((asesor) => (
                      <div
                        key={asesor.id_user}
                        className="rounded-[24px] bg-orange-50/60 border border-orange-100 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h4
                              className="font-black text-[#071E3D] text-base leading-snug truncate"
                              title={asesor.nama_lengkap}
                            >
                              {asesor.nama_lengkap}
                            </h4>

                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1 line-clamp-2">
                              {asesor.bidang_keahlian || "-"}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2">
                              <MiniInfo
                                icon={<Hash size={13} />}
                                value={`Reg: ${asesor.no_reg_asesor || "-"}`}
                              />
                              <MiniInfo
                                icon={<Phone size={13} />}
                                value={`HP: ${asesor.no_hp || "-"}`}
                              />
                              <MiniInfo
                                icon={<Award size={13} />}
                                value={`Lisensi: ${asesor.no_lisensi || "-"}`}
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteAsesor(
                                asesor.id_user,
                                asesor.nama_lengkap
                              )
                            }
                            className="w-10 h-10 rounded-2xl bg-white border border-red-100 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shrink-0"
                            title="Hapus verifikator"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </section>

            <section>
              <Card
                title="Pilih Asesor Verifikasi TUK"
                icon={<UserPlus size={22} />}
                rightBadge={filteredAsesor.length}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <StatBox
                    label="Total Aktif"
                    value={activeAsesor.length}
                    desc="verifikator"
                    icon={<UserCheck size={20} />}
                  />
                  <StatBox
                    label="Tersedia"
                    value={availableAsesor.length}
                    desc="asesor"
                    icon={<UserPlus size={20} />}
                  />
                  <StatBox
                    label="Dipilih"
                    value={selected.length}
                    desc="baru"
                    icon={<CheckCircle size={20} />}
                    highlight
                  />
                </div>

                <div className="relative mb-6">
                  <Search
                    size={20}
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Cari nama, nomor registrasi, username, atau HP..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 text-[#071E3D] font-bold transition-all"
                  />
                </div>

                {filteredAsesor.length === 0 ? (
                  <EmptyState
                    icon={<Search size={36} />}
                    title={
                      search
                        ? "Asesor tidak ditemukan"
                        : "Semua asesor sudah menjadi verifikator"
                    }
                    desc={
                      search
                        ? "Coba gunakan kata kunci pencarian lain."
                        : "Tidak ada asesor lain yang bisa ditambahkan."
                    }
                  />
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-[620px] overflow-y-auto pr-1">
                    {filteredAsesor.map((a) => {
                      const isSelected = selected.includes(Number(a.id_user));

                      return (
                        <div
                          key={a.id_user}
                          className={`rounded-[26px] border p-5 transition-all ${
                            isSelected
                              ? "bg-orange-50 border-orange-200 shadow-sm"
                              : "bg-white border-slate-100 hover:border-orange-200 hover:bg-orange-50/30"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="min-w-0">
                              <h4
                                className="font-black text-[#071E3D] text-lg leading-snug truncate"
                                title={a.nama_lengkap}
                              >
                                {a.nama_lengkap}
                              </h4>

                              <p className="text-xs text-slate-400 font-bold mt-1 line-clamp-2">
                                {a.bidang_keahlian || "-"}
                              </p>
                            </div>

                            <div
                              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? "bg-orange-500 text-white"
                                  : "bg-orange-50 text-orange-500"
                              }`}
                            >
                              {isSelected ? (
                                <CheckCircle size={20} />
                              ) : (
                                <UserPlus size={20} />
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-5">
                            <MiniInfo
                              icon={<Hash size={14} />}
                              value={`Reg: ${a.no_reg_asesor || "-"}`}
                            />
                            <MiniInfo
                              icon={<Phone size={14} />}
                              value={`HP: ${a.no_hp || "-"}`}
                            />
                            <MiniInfo
                              icon={<User size={14} />}
                              value={`Username: ${a.username || "-"}`}
                            />
                            <MiniInfo
                              icon={<Award size={14} />}
                              value={`Lisensi: ${a.no_lisensi || "-"}`}
                            />
                          </div>

                          {isSelected ? (
                            <button
                              type="button"
                              onClick={() => handleRemove(a.id_user)}
                              className="w-full px-4 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                            >
                              <XCircle size={17} />
                              Batalkan
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAdd(a.id_user)}
                              className="w-full px-4 py-3 rounded-2xl bg-orange-500 hover:bg-[#071E3D] text-white font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                            >
                              <UserPlus size={17} />
                              Tambah Verifikator
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {selected.length > 0 && (
                  <div className="sticky bottom-5 mt-6 rounded-[28px] bg-[#071E3D] text-white p-6 relative overflow-hidden shadow-xl shadow-[#071E3D]/10">
                    <div className="absolute top-0 right-0 w-44 h-44 bg-orange-500/20 rounded-full blur-3xl -mr-20 -mt-20" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                      <div>
                        <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">
                          Siap Disimpan
                        </p>
                        <h3 className="text-2xl font-black mt-1">
                          {selected.length} Verifikator Dipilih
                        </h3>
                        <p className="text-white/50 text-sm font-bold mt-1">
                          Total setelah disimpan:{" "}
                          {activeAsesor.length + selected.length} verifikator
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-4 rounded-2xl bg-orange-500 hover:bg-white hover:text-[#071E3D] text-white font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {saving ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <UserPlus size={18} />
                        )}
                        {saving
                          ? "Menyimpan..."
                          : `Simpan ${selected.length} Verifikator`}
                        {!saving && <ChevronRight size={17} />}
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

const Card = ({ title, icon, children, rightBadge }) => {
  return (
    <div className="bg-white rounded-[30px] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
            {icon}
          </div>

          <div className="min-w-0">
            <h2 className="text-xl font-black text-[#071E3D] truncate">
              {title}
            </h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
              Data Verifikasi
            </p>
          </div>
        </div>

        {rightBadge !== undefined && (
          <span className="min-w-10 h-10 px-3 rounded-2xl bg-orange-50 border border-orange-100 text-orange-500 text-xs font-black flex items-center justify-center">
            {rightBadge}
          </span>
        )}
      </div>

      <div className="p-6">{children}</div>
    </div>
  );
};

const InfoBox = ({ label, children }) => {
  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
        {label}
      </p>
      {children}
    </div>
  );
};

const MiniInfo = ({ icon, value }) => {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-100 text-slate-500 max-w-full">
      <span className="shrink-0">{icon}</span>
      <span className="text-xs font-bold truncate">{value}</span>
    </div>
  );
};

const TopStat = ({ label, value, icon, highlight = false }) => {
  return (
    <div
      className={`rounded-[24px] border p-4 ${
        highlight
          ? "bg-orange-50 border-orange-100 text-orange-500"
          : "bg-slate-50 border-slate-100 text-[#071E3D]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {label}
          </p>
          <h3 className="text-2xl font-black mt-1">{value}</h3>
        </div>

        <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center shrink-0">
          {icon}
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, desc, icon, highlight = false }) => {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight
          ? "bg-orange-50 border-orange-100 text-orange-500"
          : "bg-slate-50 border-slate-100 text-[#071E3D]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
            {label}
          </p>

          <div className="flex items-end gap-2 mt-1">
            <p className="text-2xl font-black">{value}</p>
            {desc && (
              <span className="text-xs font-black opacity-60 mb-1">
                {desc}
              </span>
            )}
          </div>
        </div>

        <div className="w-10 h-10 rounded-2xl bg-white text-orange-500 flex items-center justify-center shrink-0">
          {icon}
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ icon, title, desc }) => {
  return (
    <div className="text-center py-14 px-6 bg-slate-50 rounded-[28px] border border-dashed border-slate-200">
      <div className="w-16 h-16 mx-auto mb-4 text-slate-300 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-lg font-black text-[#071E3D] mb-2">{title}</h3>
      <p className="text-slate-400 font-medium">{desc}</p>
    </div>
  );
};

export default VerifikasiTUK;