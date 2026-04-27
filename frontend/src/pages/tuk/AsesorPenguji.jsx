// frontend/src/pages/tuk/AsesorPenguji.jsx

import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import SidebarTUK from "../../components/sidebar/SidebarTuk";
import {
  ArrowLeft,
  Loader2,
  Search,
  UserPlus,
  Trash2,
  CheckCircle,
  XCircle,
  Users,
  Calendar,
  ClipboardList,
  BadgeCheck,
  Phone,
  User,
  Hash,
  Award,
  AlertCircle,
  ChevronRight,
  Inbox,
} from "lucide-react";

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

  const filteredAsesor = useMemo(() => {
    const availableAsesor = allAsesor.filter(
      (a) => !asesorJadwal.some((j) => j.id_user === a.id_user)
    );

    return availableAsesor.filter((a) => {
      const keyword = search.toLowerCase();

      return (
        a.nama_lengkap?.toLowerCase().includes(keyword) ||
        a.no_reg_asesor?.toLowerCase().includes(keyword) ||
        a.username?.toLowerCase().includes(keyword) ||
        a.no_hp?.toLowerCase().includes(keyword)
      );
    });
  }, [allAsesor, search, asesorJadwal]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [resJadwal, resAsesorJadwal, resAllAsesor] = await Promise.all([
        axios.get(`${API_BASE}/tuk/jadwal/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/tuk/jadwal/${id}/asesor/asesor_penguji`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/tuk/asesor`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setJadwal(resJadwal.data.data);
      setAsesorJadwal(resAsesorJadwal.data.data || []);
      setAllAsesor(resAllAsesor.data.data || []);
    } catch (err) {
      console.error("Fetch Error:", err.response?.data || err);

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
  }, [fetchData, id]);

  const handleAdd = useCallback(
    (id_user) => {
      if (selected.includes(id_user)) return;
      setSelected((prev) => [...prev, id_user]);
    },
    [selected]
  );

  const handleRemove = useCallback((id_user) => {
    setSelected((prev) => prev.filter((i) => i !== id_user));
  }, []);

  const handleDeleteAsesor = useCallback(
    async (idUser) => {
      const asesor = asesorJadwal.find((a) => a.id_user === parseInt(idUser));

      if (
        !window.confirm(
          `Hapus ${asesor?.nama_lengkap || "asesor ini"} dari jadwal?`
        )
      ) {
        return;
      }

      try {
        await axios.delete(
          `${API_BASE}/tuk/jadwal/${id}/asesor/asesor_penguji/${idUser}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        alert("Asesor berhasil dihapus dari jadwal");
        fetchData();
      } catch (err) {
        console.error("Delete error:", err);
        alert(err?.response?.data?.message || "Gagal menghapus asesor");
      }
    },
    [id, token, asesorJadwal, fetchData]
  );

  const handleSave = useCallback(async () => {
    if (selected.length === 0) {
      alert("Pilih minimal 1 asesor");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        listAsesor: selected.map((id_user) => ({
          id_user: parseInt(id_user),
        })),
      };

      const res = await axios.post(
        `${API_BASE}/tuk/jadwal/${id}/asesor/asesor_penguji`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const message =
        res.data?.message ||
        `Berhasil menambahkan ${res.data?.baru || 0} asesor baru, ${
          res.data?.sudah_ada || 0
        } sudah ada`;

      alert(message);

      setSelected([]);
      fetchData();
    } catch (err) {
      console.error("Save error:", err.response?.data);

      if (err.response?.data?.invalid) {
        alert(`Asesor tidak valid: ${err.response.data.invalid.join(", ")}`);
      } else {
        alert(err?.response?.data?.message || "Gagal menyimpan asesor");
      }
    } finally {
      setSaving(false);
    }
  }, [id, token, selected, fetchData]);

  const handleLogout = useCallback(() => {
    localStorage.clear();
    navigate("/login");
  }, [navigate]);

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
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-10 text-center">
          <Loader2 className="animate-spin text-orange-500 mx-auto mb-5" size={44} />
          <p className="text-[#071E3D] font-black text-lg">
            Memuat Data Asesor
          </p>
          <p className="text-slate-400 text-sm mt-1 font-medium">
            Mohon tunggu sebentar...
          </p>
        </div>
      </div>
    );
  }

  if (!jadwal) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-10 text-center max-w-md">
          <div className="w-20 h-20 rounded-[28px] bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="text-orange-500" size={38} />
          </div>

          <h2 className="text-2xl font-black text-[#071E3D] mb-3">
            Jadwal Tidak Ditemukan
          </h2>

          <p className="text-slate-500 font-medium mb-6">
            Jadwal yang Anda cari tidak ditemukan atau Anda tidak memiliki
            akses.
          </p>

          <button
            onClick={() => navigate("/tuk/jadwal")}
            className="px-6 py-4 rounded-2xl bg-orange-500 hover:bg-[#071E3D] text-white font-black text-xs uppercase tracking-widest transition-all inline-flex items-center gap-2"
          >
            <ArrowLeft size={17} />
            Kembali ke Jadwal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <SidebarTUK
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      <main className="flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <section className="relative overflow-hidden bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 lg:p-8 mb-6">
            <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-[90px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#071E3D]/5 rounded-full blur-[90px] pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <button
                  onClick={() => navigate(-1)}
                  className="mb-5 inline-flex items-center gap-2 text-slate-400 hover:text-orange-500 font-black text-xs uppercase tracking-widest transition-colors"
                >
                  <ArrowLeft size={17} />
                  Kembali
                </button>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 mb-4">
                  <Users size={15} className="text-orange-500" />
                  <span className="text-orange-500 text-[10px] font-black uppercase tracking-widest">
                    Kelola Asesor Penguji
                  </span>
                </div>

                <h1 className="text-3xl lg:text-4xl font-black text-[#071E3D] leading-tight">
                  Asesor Penguji
                </h1>

                <p className="text-slate-500 mt-3 max-w-2xl font-medium leading-relaxed">
                  Tambahkan atau hapus asesor penguji untuk jadwal{" "}
                  <span className="font-black text-[#071E3D]">
                    {jadwal.nama_kegiatan || "-"}
                  </span>
                  .
                </p>
              </div>

              <div className="bg-[#071E3D] text-white rounded-[26px] p-5 min-w-[230px] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl -mr-12 -mt-12" />
                <div className="relative z-10">
                  <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">
                    Asesor Aktif
                  </p>
                  <div className="flex items-end justify-between mt-2">
                    <h2 className="text-4xl font-black">
                      {asesorJadwal.length}
                    </h2>
                    <UserPlus className="text-orange-400" size={30} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Panel */}
            <section className="xl:col-span-1 space-y-6">
              <Card title="Informasi Jadwal" icon={<ClipboardList size={22} />}>
                <div className="space-y-4">
                  <InfoBox label="Skema">
                    <p className="text-[#071E3D] font-black leading-snug">
                      {jadwal?.skema?.judul_skema ||
                        jadwal?.nama_skema ||
                        "Belum ditentukan"}
                    </p>
                  </InfoBox>

                  <InfoBox label="Nama Kegiatan">
                    <p className="text-[#071E3D] font-black leading-snug">
                      {jadwal?.nama_kegiatan || "-"}
                    </p>
                  </InfoBox>

                  <InfoBox label="Periode">
                    <div className="flex items-center gap-2 text-[#071E3D] font-black">
                      <Calendar size={17} className="text-orange-500" />
                      <span>
                        {formatDate(jadwal?.tgl_awal)} -{" "}
                        {formatDate(jadwal?.tgl_akhir)}
                      </span>
                    </div>
                  </InfoBox>

                  <InfoBox label="Kuota">
                    <div className="flex items-center gap-2 text-[#071E3D] font-black">
                      <Users size={17} className="text-orange-500" />
                      <span>{jadwal?.kuota || 0} peserta</span>
                    </div>
                  </InfoBox>
                </div>
              </Card>

              <Card
                title="Asesor Aktif"
                icon={<CheckCircle size={22} />}
                rightBadge={asesorJadwal.length}
              >
                {asesorJadwal.length === 0 ? (
                  <EmptyState
                    icon={<Inbox size={34} />}
                    title="Belum ada asesor"
                    desc="Tambahkan asesor penguji untuk jadwal ini."
                  />
                ) : (
                  <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                    {asesorJadwal.map((a) => (
                      <div
                        key={`${a.id}-${a.id_user}-${a.jenis_tugas}`}
                        className="rounded-[24px] bg-emerald-50/60 border border-emerald-100 p-4 group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h4
                              className="font-black text-[#071E3D] truncate"
                              title={a.nama_lengkap}
                            >
                              {a.nama_lengkap}
                            </h4>

                            <div className="mt-3 space-y-2 text-xs text-slate-500 font-medium">
                              {a.no_reg_asesor && (
                                <MiniInfo
                                  icon={<Hash size={13} />}
                                  value={`Reg: ${a.no_reg_asesor}`}
                                />
                              )}
                              {a.no_hp && (
                                <MiniInfo
                                  icon={<Phone size={13} />}
                                  value={a.no_hp}
                                />
                              )}
                              {a.username && (
                                <MiniInfo
                                  icon={<User size={13} />}
                                  value={a.username}
                                />
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteAsesor(a.id_user)}
                            className="w-10 h-10 rounded-2xl bg-white border border-red-100 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shrink-0"
                            title="Hapus dari jadwal"
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

            {/* Right Panel */}
            <section className="xl:col-span-2">
              <Card
                title="Tambah Asesor Penguji"
                icon={<UserPlus size={22} />}
                rightBadge={filteredAsesor.length}
              >
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
                        : "Semua asesor sudah terdaftar"
                    }
                    desc={
                      search
                        ? "Coba gunakan kata kunci lain."
                        : "Tidak ada asesor tersedia untuk ditambahkan."
                    }
                  />
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-[620px] overflow-y-auto pr-1">
                    {filteredAsesor.map((a) => {
                      const isSelected = selected.includes(a.id_user);

                      return (
                        <div
                          key={a.id_user}
                          className={`rounded-[26px] border p-5 transition-all ${
                            isSelected
                              ? "bg-orange-50 border-orange-200"
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

                              {a.bidang_keahlian && (
                                <p className="text-xs text-slate-400 font-bold mt-1 line-clamp-2">
                                  {a.bidang_keahlian}
                                </p>
                              )}
                            </div>

                            <div
                              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? "bg-orange-500 text-white"
                                  : "bg-orange-50 text-orange-500"
                              }`}
                            >
                              <UserPlus size={20} />
                            </div>
                          </div>

                          <div className="space-y-2 mb-5">
                            <MiniInfo
                              icon={<Hash size={14} />}
                              value={`Reg: ${a.no_reg_asesor || "-"}`}
                            />
                            <MiniInfo
                              icon={<Phone size={14} />}
                              value={`HP: ${a.no_hp || "-"}`}
                            />
                            {a.username && (
                              <MiniInfo
                                icon={<User size={14} />}
                                value={`Username: ${a.username}`}
                              />
                            )}
                            {a.no_lisensi && (
                              <MiniInfo
                                icon={<Award size={14} />}
                                value={`Lisensi: ${a.no_lisensi}`}
                              />
                            )}
                          </div>

                          {isSelected ? (
                            <button
                              onClick={() => handleRemove(a.id_user)}
                              className="w-full px-4 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                            >
                              <XCircle size={17} />
                              Batal Pilih
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAdd(a.id_user)}
                              className="w-full px-4 py-3 rounded-2xl bg-orange-500 hover:bg-[#071E3D] text-white font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                            >
                              <UserPlus size={17} />
                              Pilih Asesor
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {selected.length > 0 && (
                  <div className="mt-6 rounded-[28px] bg-[#071E3D] text-white p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-44 h-44 bg-orange-500/20 rounded-full blur-3xl -mr-20 -mt-20" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                      <div>
                        <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">
                          Siap Ditugaskan
                        </p>
                        <h3 className="text-2xl font-black mt-1">
                          {selected.length} Asesor Dipilih
                        </h3>
                      </div>

                      <button
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
                          : `Simpan ${selected.length} Asesor`}
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
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h2 className="text-xl font-black text-[#071E3D]">{title}</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
              Data Asesor
            </p>
          </div>
        </div>

        {rightBadge !== undefined && (
          <span className="px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-orange-500 text-xs font-black">
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
    <div className="inline-flex items-center gap-2 mr-2 mb-1 px-3 py-1.5 rounded-full bg-white border border-slate-100 text-slate-500">
      {icon}
      <span className="text-xs font-bold">{value}</span>
    </div>
  );
};

const EmptyState = ({ icon, title, desc }) => {
  return (
    <div className="text-center py-14 px-6 bg-slate-50 rounded-[28px] border border-dashed border-slate-200">
      <div className="w-18 h-18 mx-auto mb-4 text-slate-300 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-lg font-black text-[#071E3D] mb-2">{title}</h3>
      <p className="text-slate-400 font-medium">{desc}</p>
    </div>
  );
};

export default AsesorPenguji;