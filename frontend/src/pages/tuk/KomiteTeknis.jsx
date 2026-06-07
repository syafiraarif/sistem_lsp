// frontend/src/pages/tuk/KomiteTeknis.jsx

import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import SidebarTUK from "../../components/sidebar/SidebarTuk";
import {
  AlertCircle,
  ArrowLeft,
  Award,
  BadgeCheck,
  Calendar,
  CheckCircle,
  ChevronRight,
  ClipboardList,
  Hash,
  Inbox,
  Loader2,
  Phone,
  Search,
  Trash2,
  User,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE;

const JENIS_TUGAS = "komite_teknis";
const MIN_KOMITE = 3;
const MAX_KOMITE = 3;

export default function KomiteTeknis() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [jadwal, setJadwal] = useState(null);

  const [komiteJadwal, setKomiteJadwal] = useState([]);
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

  const getAsesorName = (item) => {
    return (
      item?.nama_lengkap ||
      item?.profileAsesor?.nama_lengkap ||
      item?.profile_asesor?.nama_lengkap ||
      item?.user?.nama_lengkap ||
      item?.asesor?.nama_lengkap ||
      item?.asesor?.username ||
      item?.user?.username ||
      item?.username ||
      "-"
    );
  };

  const getAsesorReg = (item) => {
    return (
      item?.no_reg_asesor ||
      item?.profileAsesor?.no_reg_asesor ||
      item?.profile_asesor?.no_reg_asesor ||
      "-"
    );
  };

  const getAsesorPhone = (item) => {
    return (
      item?.no_hp ||
      item?.user?.no_hp ||
      item?.asesor?.no_hp ||
      item?.profileAsesor?.no_hp ||
      "-"
    );
  };

  const getAsesorUsername = (item) => {
    return (
      item?.username ||
      item?.user?.username ||
      item?.asesor?.username ||
      "-"
    );
  };

  const getAsesorBidang = (item) => {
    return (
      item?.bidang_keahlian ||
      item?.profileAsesor?.bidang_keahlian ||
      item?.profile_asesor?.bidang_keahlian ||
      ""
    );
  };

  const getSkemaName = (value) => {
    if (!value) return "-";

    if (typeof value === "string") {
      return value;
    }

    if (typeof value === "object") {
      return (
        value.judul_skema ||
        value.nama_skema ||
        value.kode_skema ||
        "-"
      );
    }

    return String(value);
  };

  const filteredAsesor = useMemo(() => {
    const availableAsesor = allAsesor.filter(
      (asesor) =>
        !komiteJadwal.some(
          (jadwalItem) => Number(jadwalItem.id_user) === Number(asesor.id_user)
        )
    );

    const keyword = search.toLowerCase().trim();

    if (!keyword) return availableAsesor;

    return availableAsesor.filter((asesor) => {
      const text = [
        getAsesorName(asesor),
        getAsesorReg(asesor),
        getAsesorPhone(asesor),
        getAsesorUsername(asesor),
        getAsesorBidang(asesor),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(keyword);
    });
  }, [allAsesor, komiteJadwal, search]);

  const fetchData = useCallback(async () => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      setLoading(true);

      const [resJadwal, resKomiteJadwal, resAllAsesor] = await Promise.all([
        axios.get(`${API_BASE}/tuk/jadwal/${id}`, authHeader),
        axios.get(
          `${API_BASE}/tuk/jadwal/${id}/asesor/${JENIS_TUGAS}`,
          authHeader
        ),
        axios.get(`${API_BASE}/tuk/asesor`, authHeader),
      ]);

      setJadwal(resJadwal.data?.data || null);
      setKomiteJadwal(
        Array.isArray(resKomiteJadwal.data?.data)
          ? resKomiteJadwal.data.data
          : []
      );
      setAllAsesor(
        Array.isArray(resAllAsesor.data?.data)
          ? resAllAsesor.data.data
          : []
      );
    } catch (err) {
      console.error("Fetch komite teknis error:", err.response?.data || err);

      if (err.response?.status === 401) {
        alert("Session habis, silakan login kembali");
        localStorage.clear();
        navigate("/login", { replace: true });
        return;
      }

      if (err.response?.status === 404) {
        alert("Jadwal tidak ditemukan");
        navigate("/tuk/jadwal");
        return;
      }

      alert(err.response?.data?.message || "Gagal memuat data komite teknis");
    } finally {
      setLoading(false);
    }
  }, [id, token, navigate, authHeader]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = (idUser) => {
    if (selected.includes(idUser)) return;

    if (komiteJadwal.length + selected.length >= MAX_KOMITE) {
      alert(`Komite teknis maksimal ${MAX_KOMITE} asesor`);
      return;
    }

    setSelected((prev) => [...prev, idUser]);
  };

  const handleRemove = (idUser) => {
    setSelected((prev) =>
      prev.filter((item) => Number(item) !== Number(idUser))
    );
  };

  const handleDeleteKomite = async (idUser) => {
    const asesor = komiteJadwal.find(
      (item) => Number(item.id_user) === Number(idUser)
    );

    const nama = getAsesorName(asesor);

    if (!window.confirm(`Hapus ${nama} dari komite teknis jadwal ini?`)) {
      return;
    }

    try {
      await axios.delete(
        `${API_BASE}/tuk/jadwal/${id}/asesor/${JENIS_TUGAS}/${idUser}`,
        authHeader
      );

      alert("Komite teknis berhasil dihapus dari jadwal");
      setSelected([]);
      await fetchData();
    } catch (err) {
      console.error("Delete komite teknis error:", err.response?.data || err);
      alert(err.response?.data?.message || "Gagal menghapus komite teknis");
    }
  };

  const handleSave = async () => {
    const totalKomite = komiteJadwal.length + selected.length;

    if (totalKomite < MIN_KOMITE) {
      alert(`Komite teknis wajib berjumlah ${MIN_KOMITE} asesor`);
      return;
    }

    if (totalKomite > MAX_KOMITE) {
      alert(`Komite teknis maksimal ${MAX_KOMITE} asesor`);
      return;
    }

    if (selected.length === 0) {
      alert("Pilih asesor yang ingin ditambahkan terlebih dahulu");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        listAsesor: selected.map((idUser) => ({
          id_user: Number(idUser),
        })),
      };

      const res = await axios.post(
        `${API_BASE}/tuk/jadwal/${id}/asesor/${JENIS_TUGAS}`,
        payload,
        authHeader
      );

      alert(res.data?.message || "Komite teknis berhasil disimpan");

      setSelected([]);
      await fetchData();
    } catch (err) {
      console.error("Save komite teknis error:", err.response?.data || err);

      if (err.response?.data?.invalid) {
        alert(`Asesor tidak valid: ${err.response.data.invalid.join(", ")}`);
        return;
      }

      alert(err.response?.data?.message || "Gagal menyimpan komite teknis");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return date;

    return parsed.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getSelectedData = (idUser) => {
    return allAsesor.find((item) => Number(item.id_user) === Number(idUser));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex">
        <SidebarTUK
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          onLogout={handleLogout}
        />

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <Loader2
              size={44}
              className="mx-auto mb-4 animate-spin text-orange-500"
            />
            <h2 className="text-2xl font-black text-[#071E3D]">
              Memuat Data Komite Teknis
            </h2>
            <p className="mt-2 text-sm font-semibold text-slate-400">
              Mohon tunggu sebentar...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (!jadwal) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex">
        <SidebarTUK
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          onLogout={handleLogout}
        />

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="rounded-[32px] border border-slate-100 bg-white p-10 text-center shadow-sm">
            <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-black text-[#071E3D]">
              Jadwal Tidak Ditemukan
            </h2>
            <p className="mt-2 text-sm font-semibold text-slate-400">
              Jadwal yang Anda cari tidak ditemukan atau Anda tidak memiliki akses.
            </p>
            <button
              type="button"
              onClick={() => navigate("/tuk/jadwal")}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-4 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-[#071E3D]"
            >
              <ArrowLeft size={16} />
              Kembali ke Jadwal
            </button>
          </div>
        </main>
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

      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
        <div className="max-w-[1500px] mx-auto space-y-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 transition-colors hover:text-orange-500"
          >
            <ArrowLeft size={16} />
            Kembali
          </button>

          <section className="relative overflow-hidden rounded-[36px] border border-slate-100 bg-white p-6 lg:p-8 shadow-sm">
            <div className="absolute top-0 right-0 h-[420px] w-[420px] rounded-full bg-orange-500/10 blur-[110px]" />

            <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                  <Users size={15} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                    Kelola Komite Teknis
                  </span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-black leading-tight text-[#071E3D]">
                  Komite Teknis
                </h1>

                <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-500">
                  Pilih 3 asesor sebagai komite teknis untuk jadwal uji kompetensi{" "}
                  <span className="font-black text-[#071E3D]">
                    {jadwal.nama_kegiatan || "-"}
                  </span>
                  .
                </p>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={fetchData}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
                  >
                    <ClipboardList size={16} />
                    Refresh Data
                  </button>

                  {selected.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <CheckCircle size={16} />
                      )}
                      {saving ? "Menyimpan..." : `Simpan ${selected.length} Komite`}
                    </button>
                  )}
                </div>
              </div>

              <div className="rounded-[32px] bg-[#071E3D] p-6 text-white shadow-2xl shadow-[#071E3D]/15">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/50">
                  Ringkasan Jadwal
                </p>

                <h2 className="mt-2 text-2xl font-black leading-tight">
                  {jadwal.nama_kegiatan || "Jadwal Uji Kompetensi"}
                </h2>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <HeroPill
                    label="Skema"
                    value={getSkemaName(jadwal?.skema) || jadwal?.nama_skema || "-"}
                  />
                  <HeroPill
                    label="Tanggal"
                    value={`${formatDate(jadwal.tgl_awal)} - ${formatDate(
                      jadwal.tgl_akhir
                    )}`}
                  />
                  <HeroPill
                    label="Komite Aktif"
                    value={`${komiteJadwal.length} Asesor`}
                  />
                  <HeroPill label="Kebutuhan" value={`${MIN_KOMITE} Asesor`} />
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <MiniStat
              icon={<Users size={22} />}
              label="Komite Aktif"
              value={`${komiteJadwal.length} Asesor`}
            />
            <MiniStat
              icon={<UserPlus size={22} />}
              label="Asesor Tersedia"
              value={`${filteredAsesor.length} Asesor`}
            />
            <MiniStat
              icon={<BadgeCheck size={22} />}
              label="Dipilih"
              value={`${selected.length} Asesor`}
            />
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-6 items-start">
            <Card
              title="Komite Teknis Jadwal Ini"
              icon={<BadgeCheck size={22} />}
              rightBadge={komiteJadwal.length}
            >
              <InfoBox label="Informasi Jadwal">
                <div className="space-y-2">
                  <MiniInfo
                    icon={<Award size={14} />}
                    value={getSkemaName(jadwal?.skema) || jadwal?.nama_skema || "-"}
                  />
                  <MiniInfo
                    icon={<Calendar size={14} />}
                    value={`${formatDate(jadwal?.tgl_awal)} - ${formatDate(
                      jadwal?.tgl_akhir
                    )}`}
                  />
                  <MiniInfo
                    icon={<Hash size={14} />}
                    value={`ID Jadwal: ${jadwal?.id_jadwal || id}`}
                  />
                </div>
              </InfoBox>

              <div className="mt-5">
                {komiteJadwal.length === 0 ? (
                  <EmptyState
                    icon={<Inbox size={38} />}
                    title="Belum ada komite teknis"
                    desc="Tambahkan 3 asesor sebagai komite teknis untuk jadwal ini."
                  />
                ) : (
                  <div className="space-y-3">
                    {komiteJadwal.map((item) => (
                      <div
                        key={item.id_user}
                        className="rounded-[24px] border border-slate-100 bg-slate-50 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h4 className="text-base font-black text-[#071E3D]">
                              {getAsesorName(item)}
                            </h4>

                            <div className="mt-3 flex flex-wrap gap-2">
                              <MiniBadge
                                icon={<Hash size={13} />}
                                value={`Reg: ${getAsesorReg(item)}`}
                              />
                              <MiniBadge
                                icon={<Phone size={13} />}
                                value={getAsesorPhone(item)}
                              />
                              <MiniBadge
                                icon={<User size={13} />}
                                value={getAsesorUsername(item)}
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteKomite(item.id_user)}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-red-100 bg-white text-red-500 transition-all hover:bg-red-500 hover:text-white"
                            title="Hapus dari komite teknis"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            <Card
              title="Tambah Komite Teknis"
              icon={<UserPlus size={22} />}
              rightBadge={filteredAsesor.length}
            >
              <div className="relative mb-5">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama asesor, no registrasi, HP, username..."
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-4 pl-12 pr-5 text-sm font-bold text-[#071E3D] outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5"
                />
              </div>

              {selected.length > 0 && (
                <div className="mb-5 rounded-[24px] border border-orange-100 bg-orange-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                    Siap Ditugaskan
                  </p>

                  <h3 className="mt-1 text-xl font-black text-[#071E3D]">
                    {selected.length} Asesor Dipilih
                  </h3>

                  <div className="mt-3 space-y-2">
                    {selected.map((idUser) => {
                      const asesor = getSelectedData(idUser);

                      return (
                        <div
                          key={idUser}
                          className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-[#071E3D]">
                              {getAsesorName(asesor)}
                            </p>
                            <p className="text-xs font-semibold text-slate-400">
                              Reg: {getAsesorReg(asesor)}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemove(idUser)}
                            className="text-red-500 hover:text-red-700"
                            title="Batalkan pilihan"
                          >
                            <XCircle size={20} />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-4 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-[#071E3D] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                    {saving ? "Menyimpan..." : "Simpan Komite Teknis"}
                  </button>
                </div>
              )}

              {filteredAsesor.length === 0 ? (
                <EmptyState
                  icon={<Inbox size={38} />}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredAsesor.map((asesor) => {
                    const isSelected = selected.includes(asesor.id_user);
                    const isDisabled =
                      !isSelected &&
                      komiteJadwal.length + selected.length >= MAX_KOMITE;

                    return (
                      <div
                        key={asesor.id_user}
                        className={`rounded-[24px] border p-4 transition-all ${
                          isSelected
                            ? "border-orange-200 bg-orange-50"
                            : "border-slate-100 bg-slate-50 hover:border-orange-100 hover:bg-white"
                        }`}
                      >
                        <h4 className="text-base font-black text-[#071E3D]">
                          {getAsesorName(asesor)}
                        </h4>

                        {getAsesorBidang(asesor) && (
                          <p className="mt-1 text-xs font-bold text-orange-500">
                            {getAsesorBidang(asesor)}
                          </p>
                        )}

                        <div className="mt-3 space-y-2">
                          <MiniInfo
                            icon={<Hash size={14} />}
                            value={`Reg: ${getAsesorReg(asesor)}`}
                          />
                          <MiniInfo
                            icon={<Phone size={14} />}
                            value={`HP: ${getAsesorPhone(asesor)}`}
                          />
                          <MiniInfo
                            icon={<User size={14} />}
                            value={`Username: ${getAsesorUsername(asesor)}`}
                          />
                        </div>

                        {isSelected ? (
                          <button
                            type="button"
                            onClick={() => handleRemove(asesor.id_user)}
                            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-red-600"
                          >
                            <XCircle size={15} />
                            Batal Pilih
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAdd(asesor.id_user)}
                            disabled={isDisabled}
                            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-[#071E3D] disabled:cursor-not-allowed disabled:bg-slate-300"
                          >
                            <UserPlus size={15} />
                            Pilih Asesor
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}

function Card({ title, icon, children, rightBadge }) {
  return (
    <section className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
            {icon}
          </div>
          <div>
            <h2 className="text-xl font-black text-[#071E3D]">{title}</h2>
            <p className="text-xs font-bold text-slate-400">Data Asesor</p>
          </div>
        </div>

        {rightBadge !== undefined && (
          <span className="rounded-full bg-[#071E3D] px-3 py-1 text-xs font-black text-white">
            {rightBadge}
          </span>
        )}
      </div>

      {children}
    </section>
  );
}

function InfoBox({ label, children }) {
  return (
    <div className="rounded-[24px] border border-slate-100 bg-slate-50 p-4">
      <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </p>
      {children}
    </div>
  );
}

function MiniInfo({ icon, value }) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
      <span className="text-orange-500">{icon}</span>
      <span className="line-clamp-1">{value || "-"}</span>
    </div>
  );
}

function MiniBadge({ icon, value }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-500">
      <span className="text-orange-500">{icon}</span>
      {value || "-"}
    </span>
  );
}

function MiniStat({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {label}
        </p>
        <p className="mt-1 truncate font-black text-[#071E3D]">{value}</p>
      </div>
    </div>
  );
}

function HeroPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
      <p className="text-[9px] font-black uppercase tracking-widest text-white/40">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-white line-clamp-2">
        {value || "-"}
      </p>
    </div>
  );
}

function EmptyState({ icon, title, desc }) {
  return (
    <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-slate-300">
        {icon}
      </div>
      <h3 className="text-lg font-black text-[#071E3D]">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm font-medium text-slate-400">
        {desc}
      </p>
    </div>
  );
}