// frontend/src/pages/asesor/PesertaJadwalAsesor.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SidebarAsesor from "../../components/sidebar/SidebarAsesor";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Info,
  Loader2,
  RefreshCcw,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import api from "../../services/api";

export default function PesertaJadwalAsesor() {
  const { id_jadwal } = useParams();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pesertaList, setPesertaList] = useState([]);
  const [nilaiForm, setNilaiForm] = useState({});
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");

  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [pesan, setPesan] = useState("");
  const [error, setError] = useState("");

  const displayName = getDisplayName();

  const fetchPeserta = async () => {
    try {
      setLoading(true);
      setError("");
      setPesan("");

      const res = await api.get(`/asesor/jadwal/${id_jadwal}/peserta`);
      const data = Array.isArray(res.data?.data) ? res.data.data : [];

      setPesertaList(data);
      setNilaiForm(createInitialNilaiForm(data));
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Gagal mengambil data peserta jadwal"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeserta();
  }, [id_jadwal]);

  const filteredPeserta = useMemo(() => {
    const keyword = search.toLowerCase();

    return pesertaList.filter((item) => {
      const user = getUserObject(item);

      const text = [
        user.nama,
        user.nama_lengkap,
        user.username,
        user.email,
        item.status_asesmen,
        item.nilai_akhir,
        item.keterangan,
        item.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchSearch = text.includes(keyword);

      const status = item.status_asesmen || "belum_dinilai";
      const matchStatus =
        filterStatus === "semua" || status === filterStatus;

      return matchSearch && matchStatus;
    });
  }, [pesertaList, search, filterStatus]);

  const totalPeserta = pesertaList.length;
  const totalKompeten = pesertaList.filter(
    (item) => item.status_asesmen === "kompeten"
  ).length;
  const totalBelumKompeten = pesertaList.filter(
    (item) => item.status_asesmen === "belum_kompeten"
  ).length;
  const totalBelumDinilai = pesertaList.filter(
    (item) => !item.status_asesmen
  ).length;

  const jadwalInfo = pesertaList[0]?.jadwal || null;

  const handleChangeNilai = (idPesertaJadwal, field, value) => {
    setNilaiForm((prev) => ({
      ...prev,
      [idPesertaJadwal]: {
        ...prev[idPesertaJadwal],
        [field]: value,
      },
    }));
  };

  const handleSimpanNilai = async (peserta) => {
    const idPesertaJadwal = getPesertaJadwalId(peserta);
    const form = nilaiForm[idPesertaJadwal] || {};

    if (!idPesertaJadwal) {
      setError("ID peserta jadwal tidak ditemukan");
      return;
    }

    if (!form.status_asesmen) {
      setError("Status asesmen wajib dipilih");
      return;
    }

    if (
      form.nilai_akhir === "" ||
      form.nilai_akhir === undefined ||
      form.nilai_akhir === null
    ) {
      setError("Nilai akhir wajib diisi");
      return;
    }

    try {
      setSavingId(idPesertaJadwal);
      setError("");
      setPesan("");

      await api.put(`/asesor/peserta/${idPesertaJadwal}/nilai`, {
        status_asesmen: form.status_asesmen,
        nilai_akhir: Number(form.nilai_akhir),
        keterangan: form.keterangan || "",
      });

      setPesan("Nilai peserta berhasil disimpan");
      await fetchPeserta();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Gagal menyimpan nilai peserta"
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleSimpanSemua = async () => {
    try {
      setLoading(true);
      setError("");
      setPesan("");

      for (const peserta of pesertaList) {
        const idPesertaJadwal = getPesertaJadwalId(peserta);
        const form = nilaiForm[idPesertaJadwal] || {};

        if (!idPesertaJadwal) continue;
        if (!form.status_asesmen) continue;
        if (
          form.nilai_akhir === "" ||
          form.nilai_akhir === undefined ||
          form.nilai_akhir === null
        ) {
          continue;
        }

        await api.put(`/asesor/peserta/${idPesertaJadwal}/nilai`, {
          status_asesmen: form.status_asesmen,
          nilai_akhir: Number(form.nilai_akhir),
          keterangan: form.keterangan || "",
        });
      }

      setPesan("Semua nilai yang terisi berhasil disimpan");
      await fetchPeserta();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Gagal menyimpan semua nilai peserta"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <SidebarAsesor isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* HERO */}
          <section className="relative overflow-hidden rounded-[36px] border border-slate-100 bg-white shadow-sm">
            <div className="absolute top-0 right-0 w-[430px] h-[430px] bg-orange-500/10 rounded-full blur-[110px]" />
            <div className="absolute -bottom-24 -left-24 w-[380px] h-[380px] bg-[#071E3D]/5 rounded-full blur-[100px]" />

            <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6 p-6 lg:p-8">
              <div className="flex flex-col justify-center">
                <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                  <Users size={15} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                    Peserta Jadwal
                  </span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-black leading-tight text-[#071E3D]">
                  Peserta Uji
                  <br />
                  <span className="text-orange-500">{displayName}</span>
                </h1>

                <p className="mt-5 max-w-2xl text-base lg:text-lg font-medium leading-relaxed text-slate-500">
                  Kelola daftar peserta pada jadwal uji kompetensi, isi nilai
                  akhir, tentukan status kompetensi, dan tambahkan keterangan
                  penilaian.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/asesor/jadwal-saya")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-7 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                  >
                    <ArrowLeft size={17} />
                    Kembali
                  </button>

                  <button
                    type="button"
                    onClick={fetchPeserta}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {loading ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <RefreshCcw size={17} />
                    )}
                    Refresh Peserta
                  </button>

                  <button
                    type="button"
                    onClick={handleSimpanSemua}
                    disabled={loading || pesertaList.length === 0}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-7 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white disabled:cursor-not-allowed disabled:bg-slate-200"
                  >
                    <Save size={17} />
                    Simpan Semua
                  </button>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[32px] bg-[#071E3D] p-6 text-white shadow-2xl shadow-[#071E3D]/15">
                <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />

                <div className="relative z-10">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-orange-400">
                    <Sparkles size={28} />
                  </div>

                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/50">
                    Ringkasan Peserta
                  </p>

                  <h2 className="mb-4 text-2xl font-black">
                    {totalPeserta} Peserta
                  </h2>

                  <p className="text-sm font-medium leading-relaxed text-white/60">
                    Data peserta diambil berdasarkan jadwal uji kompetensi yang
                    sedang dibuka.
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <HeroPill
                      label="Kompeten"
                      value={`${totalKompeten} Peserta`}
                    />
                    <HeroPill
                      label="Belum Dinilai"
                      value={`${totalBelumDinilai} Peserta`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {pesan && (
            <AlertBox
              type="success"
              icon={<BadgeCheck size={20} />}
              message={pesan}
            />
          )}

          {error && (
            <AlertBox
              type="error"
              icon={<XCircle size={20} />}
              message={error}
            />
          )}

          {loading && (
            <AlertBox
              type="loading"
              icon={<Loader2 size={20} className="animate-spin" />}
              message="Memuat data peserta..."
            />
          )}

          {/* JADWAL INFO */}
          {jadwalInfo && (
            <section className="rounded-[32px] border border-slate-100 bg-white shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoBox
                  icon={<CalendarCheck size={18} />}
                  label="Jadwal"
                  value={
                    jadwalInfo.nama_kegiatan ||
                    jadwalInfo.nama_skema ||
                    "Jadwal Uji Kompetensi"
                  }
                />
                <InfoBox
                  icon={<FileText size={18} />}
                  label="Skema"
                  value={
                    jadwalInfo.skema?.nama_skema ||
                    jadwalInfo.skema?.judul_skema ||
                    jadwalInfo.nama_skema ||
                    "-"
                  }
                />
                <InfoBox
                  icon={<Info size={18} />}
                  label="Status"
                  value={jadwalInfo.status || "-"}
                />
              </div>
            </section>
          )}

          {/* STATS */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <MiniStat
              icon={<Users size={22} />}
              label="Total Peserta"
              value={`${totalPeserta} Peserta`}
            />
            <MiniStat
              icon={<CheckCircle2 size={22} />}
              label="Kompeten"
              value={`${totalKompeten} Peserta`}
            />
            <MiniStat
              icon={<ShieldCheck size={22} />}
              label="Belum Kompeten"
              value={`${totalBelumKompeten} Peserta`}
            />
            <MiniStat
              icon={<Info size={22} />}
              label="Belum Dinilai"
              value={`${totalBelumDinilai} Peserta`}
            />
          </section>

          {/* FILTER */}
          <section className="rounded-[32px] border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                  <Search size={15} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                    Filter Peserta
                  </span>
                </div>

                <h2 className="text-2xl lg:text-3xl font-black text-[#071E3D]">
                  Daftar Peserta Uji
                </h2>

                <p className="mt-2 text-sm font-medium text-slate-400">
                  Cari peserta berdasarkan nama, email, status asesmen, atau
                  keterangan.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSimpanSemua}
                disabled={loading || pesertaList.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <Save size={16} />
                Simpan Semua
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-4">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama peserta, email, status, atau keterangan..."
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-12 py-4 text-sm font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-black text-[#071E3D] outline-none transition-all focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
              >
                <option value="semua">Semua Status</option>
                <option value="kompeten">Kompeten</option>
                <option value="belum_kompeten">Belum Kompeten</option>
                <option value="belum_dinilai">Belum Dinilai</option>
              </select>
            </div>
          </section>

          {/* LIST */}
          <section className="space-y-5">
            {filteredPeserta.length === 0 ? (
              <EmptyState loading={loading} />
            ) : (
              filteredPeserta.map((peserta, index) => {
                const idPesertaJadwal = getPesertaJadwalId(peserta);
                const form = nilaiForm[idPesertaJadwal] || {
                  status_asesmen: "",
                  nilai_akhir: "",
                  keterangan: "",
                };

                return (
                  <PesertaCard
                    key={`${idPesertaJadwal}-${index}`}
                    peserta={peserta}
                    index={index}
                    form={form}
                    saving={savingId === idPesertaJadwal}
                    onChange={(field, value) =>
                      handleChangeNilai(idPesertaJadwal, field, value)
                    }
                    onSave={() => handleSimpanNilai(peserta)}
                  />
                );
              })
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function PesertaCard({ peserta, index, form, saving, onChange, onSave }) {
  const user = getUserObject(peserta);

  const nama =
    user.nama_lengkap ||
    user.nama ||
    user.username ||
    peserta.nama_lengkap ||
    peserta.nama ||
    "Nama peserta belum tersedia";

  const email = user.email || peserta.email || "-";
  const nik = user.nik || peserta.nik || peserta.no_identitas || "-";

  return (
    <article className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
      <div className="p-6">
        <div className="mb-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
              <Users size={25} />
            </div>

            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-orange-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-orange-500">
                  Peserta #{index + 1}
                </span>

                <StatusAsesmenBadge status={form.status_asesmen} />
              </div>

              <h3 className="text-2xl font-black text-[#071E3D]">
                {nama}
              </h3>

              <p className="mt-1 text-sm font-medium text-slate-500">
                {email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Simpan Nilai
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[180px_220px_1fr] gap-4">
          <div>
            <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
              Nilai Akhir
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={form.nilai_akhir || ""}
              onChange={(e) => onChange("nilai_akhir", e.target.value)}
              placeholder="0 - 100"
              className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-black text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
              Status Asesmen
            </label>
            <select
              value={form.status_asesmen || ""}
              onChange={(e) => onChange("status_asesmen", e.target.value)}
              className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-black text-[#071E3D] outline-none transition-all focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
            >
              <option value="">Pilih status</option>
              <option value="kompeten">Kompeten</option>
              <option value="belum_kompeten">Belum Kompeten</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
              Keterangan
            </label>
            <textarea
              value={form.keterangan || ""}
              onChange={(e) => onChange("keterangan", e.target.value)}
              rows="3"
              placeholder="Masukkan keterangan penilaian..."
              className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
            />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoBox
            icon={<UserCheck size={18} />}
            label="NIK / Identitas"
            value={nik}
          />
          <InfoBox
            icon={<Star size={18} />}
            label="Nilai Saat Ini"
            value={peserta.nilai_akhir ?? "-"}
          />
          <InfoBox
            icon={<ClipboardCheck size={18} />}
            label="Status Tersimpan"
            value={formatStatusAsesmen(peserta.status_asesmen)}
          />
        </div>
      </div>
    </article>
  );
}

function InfoBox({ icon, label, value }) {
  return (
    <div className="rounded-[24px] border border-slate-100 bg-slate-50/70 p-4">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-orange-500">
        {icon}
      </div>

      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-[#071E3D] line-clamp-2">
        {value || "-"}
      </p>
    </div>
  );
}

function StatusAsesmenBadge({ status }) {
  if (status === "kompeten") {
    return (
      <span className="inline-flex items-center rounded-full bg-green-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-green-600">
        Kompeten
      </span>
    );
  }

  if (status === "belum_kompeten") {
    return (
      <span className="inline-flex items-center rounded-full bg-red-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-500">
        Belum Kompeten
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-slate-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
      Belum Dinilai
    </span>
  );
}

function MiniStat({ icon, label, value }) {
  return (
    <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-5 flex items-center gap-4">
      <div className="w-13 h-13 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
        {icon}
      </div>

      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {label}
        </p>
        <p className="text-[#071E3D] font-black mt-1">{value}</p>
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
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function AlertBox({ type, icon, message }) {
  const styles = {
    success: "border-green-100 bg-green-50 text-green-700",
    error: "border-red-100 bg-red-50 text-red-600",
    loading: "border-blue-100 bg-blue-50 text-blue-600",
  };

  return (
    <div
      className={`rounded-[24px] border px-5 py-4 text-sm font-semibold flex items-center gap-3 ${
        styles[type] || styles.loading
      }`}
    >
      <div className="shrink-0">{icon}</div>
      <span>{message}</span>
    </div>
  );
}

function EmptyState({ loading }) {
  return (
    <div className="rounded-[32px] border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
        {loading ? (
          <Loader2 size={30} className="animate-spin" />
        ) : (
          <Users size={30} />
        )}
      </div>

      <h3 className="text-2xl font-black text-[#071E3D]">
        {loading ? "Memuat Peserta" : "Belum Ada Peserta"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-relaxed text-slate-500">
        {loading
          ? "Sistem sedang mengambil data peserta jadwal."
          : "Belum ada peserta pada jadwal ini, atau data tidak cocok dengan filter pencarian."}
      </p>
    </div>
  );
}

function createInitialNilaiForm(data) {
  const initial = {};

  data.forEach((item) => {
    const id = getPesertaJadwalId(item);

    if (!id) return;

    initial[id] = {
      status_asesmen: item.status_asesmen || "",
      nilai_akhir:
        item.nilai_akhir === null || item.nilai_akhir === undefined
          ? ""
          : item.nilai_akhir,
      keterangan: item.keterangan || "",
    };
  });

  return initial;
}

function getPesertaJadwalId(item) {
  return item?.id_peserta_jadwal || item?.id || item?.id_peserta;
}

function getUserObject(item) {
  return item?.user || item?.User || item?.asesi || item?.peserta || {};
}

function getDisplayName() {
  try {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    return (
      user?.nama ||
      user?.nama_lengkap ||
      user?.username ||
      user?.name ||
      "Asesor"
    );
  } catch (err) {
    return "Asesor";
  }
}

function formatStatusAsesmen(status) {
  if (status === "kompeten") return "Kompeten";
  if (status === "belum_kompeten") return "Belum Kompeten";
  return "Belum Dinilai";
}