// frontend/src/pages/asesor/JadwalVerifikasiTuk.jsx

import React, { useEffect, useMemo, useState } from "react";
import SidebarAsesor from "../../components/sidebar/SidebarAsesor";
import {
  BadgeCheck,
  Building2,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  Filter,
  Info,
  Loader2,
  MapPin,
  RefreshCcw,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import api from "../../services/api";

export default function JadwalVerifikasiTuk() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [jadwalList, setJadwalList] = useState([]);
  const [persyaratanList, setPersyaratanList] = useState([]);
  const [selectedJadwal, setSelectedJadwal] = useState(null);

  const [detail, setDetail] = useState([]);
  const [keputusan, setKeputusan] = useState("");
  const [existingVerifikasi, setExistingVerifikasi] = useState(null);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [pesan, setPesan] = useState("");
  const [error, setError] = useState("");

  const displayName = getDisplayName();

  const loadPageData = async () => {
    try {
      setLoading(true);
      setError("");
      setPesan("");

      const [jadwalRes, formRes] = await Promise.all([
        api.get("/asesor/jadwal-verifikasi-tuk"),
        api.get("/asesor/verifikasi-tuk/form"),
      ]);

      const jadwalData = Array.isArray(jadwalRes.data?.data)
        ? jadwalRes.data.data
        : [];

      const formData = Array.isArray(formRes.data?.data)
        ? formRes.data.data
        : [];

      setJadwalList(jadwalData);
      setPersyaratanList(formData);

      if (jadwalData.length > 0) {
        const firstJadwal = jadwalData[0];

        setSelectedJadwal(firstJadwal);
        await loadDetailVerifikasi(firstJadwal, formData);
      } else {
        setSelectedJadwal(null);
        setExistingVerifikasi(null);
        setKeputusan("");
        setDetail(createEmptyDetail(formData));
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Gagal memuat jadwal verifikasi TUK");
    } finally {
      setLoading(false);
    }
  };

  const loadDetailVerifikasi = async (
    jadwalItem,
    formData = persyaratanList
  ) => {
    try {
      const idJadwal = getJadwalId(jadwalItem);

      if (!idJadwal) {
        setExistingVerifikasi(null);
        setKeputusan("");
        setDetail(createEmptyDetail(formData));
        return;
      }

      const res = await api.get(`/asesor/verifikasi-tuk/${idJadwal}`);
      const data = res.data?.data || null;

      if (!data) {
        setExistingVerifikasi(null);
        setKeputusan("");
        setDetail(createEmptyDetail(formData));
        return;
      }

      setExistingVerifikasi(data);
      setKeputusan(data.keputusan || "");

      const existingDetails = Array.isArray(data.details) ? data.details : [];
      setDetail(mergeDetailWithPersyaratan(formData, existingDetails));
    } catch (err) {
      setExistingVerifikasi(null);
      setKeputusan("");
      setDetail(createEmptyDetail(formData));
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  const filteredJadwal = useMemo(() => {
    const keyword = search.toLowerCase();

    return jadwalList.filter((item) => {
      const jadwal = item.jadwal || {};

      const text = [
        item.status,
        item.catatan,
        jadwal.kode_jadwal,
        jadwal.nama_kegiatan,
        jadwal.nama_skema,
        jadwal.skema?.nama_skema,
        jadwal.skema?.judul_skema,
        jadwal.nama_tuk,
        jadwal.tuk?.nama_tuk,
        jadwal.tuk?.nama,
        jadwal.tempat,
        jadwal.lokasi,
        jadwal.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchSearch = text.includes(keyword);
      const matchStatus =
        filterStatus === "semua" || item.status === filterStatus;

      return matchSearch && matchStatus;
    });
  }, [jadwalList, search, filterStatus]);

  const totalJadwal = jadwalList.length;
  const totalAktif = jadwalList.filter((item) => item.status === "aktif").length;
  const totalNonaktif = jadwalList.filter(
    (item) => item.status === "nonaktif"
  ).length;

  const totalPersyaratan = detail.length;
  const totalTerisi = detail.filter((item) => {
    return (
      Number(item.jumlah_total || 0) > 0 ||
      Number(item.jumlah_baik || 0) > 0 ||
      Number(item.jumlah_rusak || 0) > 0 ||
      item.keterangan
    );
  }).length;

  const handleSelectJadwal = async (item) => {
    setSelectedJadwal(item);
    setPesan("");
    setError("");

    await loadDetailVerifikasi(item);
  };

  const handleDetailChange = (index, field, value) => {
    setDetail((prev) =>
      prev.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        return {
          ...item,
          [field]: field === "keterangan" ? value : onlyNumber(value),
        };
      })
    );
  };

  const handleSubmit = async () => {
    if (!selectedJadwal) {
      setError("Pilih jadwal verifikasi TUK terlebih dahulu");
      return;
    }

    if (!keputusan) {
      setError("Keputusan verifikasi wajib dipilih");
      return;
    }

    if (!detail || detail.length === 0) {
      setError("Detail persyaratan tidak boleh kosong");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setPesan("");

      const idJadwal = getJadwalId(selectedJadwal);

      const payload = {
        keputusan,
        detail: detail.map((item) => ({
          id_persyaratan_tuk: item.id_persyaratan_tuk,
          jumlah_total: Number(item.jumlah_total || 0),
          jumlah_baik: Number(item.jumlah_baik || 0),
          jumlah_rusak: Number(item.jumlah_rusak || 0),
          keterangan: item.keterangan || "",
        })),
      };

      if (existingVerifikasi?.id_verifikasi) {
        await api.put(
          `/asesor/verifikasi-tuk/${existingVerifikasi.id_verifikasi}/update`,
          payload
        );

        setPesan("Verifikasi TUK berhasil diupdate");
      } else {
        await api.post(`/asesor/verifikasi-tuk/${idJadwal}/submit`, payload);

        setPesan("Verifikasi TUK berhasil disimpan");
      }

      await loadDetailVerifikasi(selectedJadwal);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Gagal menyimpan verifikasi TUK");
    } finally {
      setSaving(false);
    }
  };

  const handleResetForm = () => {
    if (existingVerifikasi) {
      loadDetailVerifikasi(selectedJadwal);
      return;
    }

    setKeputusan("");
    setDetail(createEmptyDetail(persyaratanList));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <SidebarAsesor isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300 overflow-x-hidden">
        <div className="w-full max-w-[1500px] mx-auto space-y-6">
          <section className="relative overflow-hidden rounded-[36px] border border-slate-100 bg-white shadow-sm">
            <div className="absolute top-0 right-0 w-[430px] h-[430px] bg-orange-500/10 rounded-full blur-[110px]" />
            <div className="absolute -bottom-24 -left-24 w-[380px] h-[380px] bg-[#071E3D]/5 rounded-full blur-[100px]" />

            <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6 p-6 lg:p-8">
              <div className="flex flex-col justify-center">
                <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                  <ShieldCheck size={15} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                    Jadwal Verifikasi TUK
                  </span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-black leading-tight text-[#071E3D]">
                  Verifikasi Tempat Uji
                  <br />
                  <span className="text-orange-500">{displayName}</span>
                </h1>

                <p className="mt-5 max-w-2xl text-base lg:text-lg font-medium leading-relaxed text-slate-500">
                  Pilih jadwal TUK, isi kondisi persyaratan, lalu simpan
                  keputusan verifikasi untuk mendukung kesiapan pelaksanaan
                  asesmen.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={loadPageData}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:bg-slate-300 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <RefreshCcw size={17} />
                    )}
                    Refresh Data
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={saving || !selectedJadwal}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-7 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white disabled:bg-slate-200 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <Save size={17} />
                    )}
                    {existingVerifikasi
                      ? "Update Verifikasi"
                      : "Simpan Verifikasi"}
                  </button>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[32px] bg-[#071E3D] p-6 text-white shadow-2xl shadow-[#071E3D]/15">
                <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />

                <div className="relative z-10 flex h-full flex-col">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-orange-400">
                    <Sparkles size={28} />
                  </div>

                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/50">
                    Ringkasan Verifikasi
                  </p>

                  <h2 className="text-2xl font-black leading-tight">
                    {totalJadwal} Jadwal TUK
                  </h2>

                  <p className="mt-4 text-sm font-medium leading-relaxed text-white/60">
                    Jadwal ini khusus untuk asesor dengan tugas sebagai
                    verifikator TUK.
                  </p>

                  <div className="mt-auto pt-6 grid grid-cols-2 gap-3">
                    <HeroPill label="Aktif" value={`${totalAktif} Jadwal`} />
                    <HeroPill
                      label="Nonaktif"
                      value={`${totalNonaktif} Jadwal`}
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
              message="Memuat data verifikasi TUK..."
            />
          )}

          <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <MiniStat
              icon={<CalendarDays size={22} />}
              label="Jadwal Verifikasi"
              value={`${totalJadwal} Jadwal`}
            />
            <MiniStat
              icon={<ClipboardCheck size={22} />}
              label="Persyaratan"
              value={`${totalPersyaratan} Item`}
            />
            <MiniStat
              icon={<CheckCircle2 size={22} />}
              label="Terisi"
              value={`${totalTerisi} Item`}
            />
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-[410px_1fr] gap-6 items-start">
            <aside className="rounded-[32px] border border-slate-100 bg-white shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                  <Filter size={15} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                    Pilih Jadwal
                  </span>
                </div>

                <h2 className="text-2xl font-black text-[#071E3D]">
                  Jadwal Verifikasi
                </h2>

                <p className="mt-2 text-sm font-medium text-slate-400">
                  Pilih jadwal TUK yang akan diverifikasi.
                </p>
              </div>

              <div className="p-5 space-y-4">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari jadwal, skema, TUK..."
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-12 py-4 text-sm font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-black text-[#071E3D] outline-none transition-all focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                >
                  <option value="semua">Semua Status</option>
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </div>

              <div className="max-h-[700px] overflow-y-auto p-5 pt-0 space-y-3">
                {filteredJadwal.length === 0 ? (
                  <EmptySmall
                    title="Jadwal tidak ditemukan"
                    description="Belum ada jadwal verifikasi TUK yang cocok."
                  />
                ) : (
                  filteredJadwal.map((item, index) => (
                    <JadwalCard
                      key={`${item.id_jadwal}-${item.id_user}-${item.jenis_tugas}-${index}`}
                      item={item}
                      active={isSameJadwal(item, selectedJadwal)}
                      onClick={() => handleSelectJadwal(item)}
                    />
                  ))
                )}
              </div>
            </aside>

            <section className="rounded-[32px] border border-slate-100 bg-white shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                    <FileCheck2 size={15} className="text-orange-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                      Form Verifikasi
                    </span>
                  </div>

                  <h2 className="text-2xl lg:text-3xl font-black text-[#071E3D]">
                    Persyaratan TUK
                  </h2>

                  <p className="mt-2 text-sm font-medium text-slate-400">
                    {selectedJadwal
                      ? getJadwalTitle(selectedJadwal)
                      : "Pilih jadwal terlebih dahulu."}
                  </p>
                </div>

                <StatusSubmitBadge existing={existingVerifikasi} />
              </div>

              <div className="p-6 space-y-6">
                {!selectedJadwal ? (
                  <EmptyState
                    title="Belum Ada Jadwal Dipilih"
                    description="Pilih jadwal verifikasi TUK di sisi kiri untuk mulai mengisi form."
                  />
                ) : (
                  <>
                    <JadwalSummary item={selectedJadwal} />

                    <div className="rounded-[30px] border border-slate-100 bg-slate-50/60 p-5">
                      <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Keputusan Verifikasi
                      </label>

                      <select
                        value={keputusan}
                        onChange={(e) => setKeputusan(e.target.value)}
                        className="w-full rounded-2xl border border-slate-100 bg-white px-4 py-4 text-sm font-black text-[#071E3D] outline-none transition-all focus:border-orange-200 focus:ring-4 focus:ring-orange-500/10"
                      >
                        <option value="">Pilih keputusan</option>
                        <option value="layak">Layak</option>
                        <option value="tidak_layak">Tidak Layak</option>
                        <option value="perlu_perbaikan">Perlu Perbaikan</option>
                      </select>
                    </div>

                    {detail.length === 0 ? (
                      <EmptyState
                        title="Persyaratan Belum Tersedia"
                        description="Data persyaratan TUK belum ditemukan dari endpoint form."
                      />
                    ) : (
                      <div className="space-y-4">
                        {detail.map((item, index) => (
                          <PersyaratanCard
                            key={`${item.id_persyaratan_tuk}-${index}`}
                            item={item}
                            index={index}
                            onChange={handleDetailChange}
                          />
                        ))}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-[30px] border border-slate-100 bg-slate-50/60 p-5">
                      <div>
                        <p className="text-sm font-black text-[#071E3D]">
                          {existingVerifikasi
                            ? "Update data verifikasi TUK"
                            : "Simpan data verifikasi TUK"}
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-400">
                          TTD asesor akan otomatis memakai tanda tangan yang
                          tersimpan pada profile asesor.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          type="button"
                          onClick={handleResetForm}
                          disabled={saving}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-white px-6 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white disabled:bg-slate-200 disabled:cursor-not-allowed"
                        >
                          <RefreshCcw size={16} />
                          Reset
                        </button>

                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={saving || detail.length === 0}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:bg-slate-300 disabled:cursor-not-allowed"
                        >
                          {saving ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Save size={16} />
                          )}
                          {existingVerifikasi ? "Update" : "Simpan"}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </section>
          </section>
        </div>
      </main>
    </div>
  );
}

function JadwalCard({ item, active, onClick }) {
  const jadwal = item.jadwal || {};
  const title = getJadwalTitle(item);
  const tanggal = getJadwalDate(jadwal);
  const tuk = getJadwalTuk(jadwal);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-[24px] border p-4 transition-all ${
        active
          ? "border-orange-200 bg-orange-50 shadow-lg shadow-orange-500/5"
          : "border-slate-100 bg-slate-50/60 hover:border-orange-100 hover:bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className={`text-[10px] font-black uppercase tracking-widest ${
              active ? "text-orange-500" : "text-slate-400"
            }`}
          >
            Verifikator TUK
          </p>

          <h3 className="mt-2 line-clamp-2 text-sm font-black text-[#071E3D]">
            {title}
          </h3>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${
            item.status === "aktif"
              ? "bg-green-50 text-green-600"
              : "bg-red-50 text-red-500"
          }`}
        >
          {item.status || "aktif"}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        <SmallLine
          icon={<CalendarCheck size={14} />}
          text={formatTanggal(tanggal)}
        />
        <SmallLine icon={<MapPin size={14} />} text={tuk} />
      </div>
    </button>
  );
}

function JadwalSummary({ item }) {
  const jadwal = item.jadwal || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <SummaryBox
        icon={<CalendarCheck size={18} />}
        label="Tanggal"
        value={formatRentangTanggal(
          jadwal.tgl_awal || jadwal.tanggal || jadwal.tanggal_uji,
          jadwal.tgl_akhir || jadwal.tanggal_selesai
        )}
      />
      <SummaryBox
        icon={<Building2 size={18} />}
        label="TUK / Lokasi"
        value={getJadwalTuk(jadwal)}
      />
      <SummaryBox
        icon={<ShieldCheck size={18} />}
        label="Status Tugas"
        value={item.status || "aktif"}
      />
    </div>
  );
}

function PersyaratanCard({ item, index, onChange }) {
  return (
    <article className="rounded-[28px] border border-slate-100 bg-slate-50/60 p-5">
      <div className="mb-5 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 font-black">
          {index + 1}
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Persyaratan TUK
          </p>

          <h3 className="mt-1 text-lg font-black text-[#071E3D]">
            {item.nama_persyaratan ||
              item.nama ||
              item.persyaratan ||
              item.nama_item ||
              "-"}
          </h3>

          {item.kategori && (
            <p className="mt-1 text-xs font-semibold text-slate-400">
              {item.kategori}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NumberInput
          label="Jumlah Total"
          value={item.jumlah_total}
          onChange={(value) => onChange(index, "jumlah_total", value)}
        />
        <NumberInput
          label="Jumlah Baik"
          value={item.jumlah_baik}
          onChange={(value) => onChange(index, "jumlah_baik", value)}
        />
        <NumberInput
          label="Jumlah Rusak"
          value={item.jumlah_rusak}
          onChange={(value) => onChange(index, "jumlah_rusak", value)}
        />
      </div>

      <div className="mt-4">
        <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
          Keterangan
        </label>

        <textarea
          value={item.keterangan || ""}
          onChange={(e) => onChange(index, "keterangan", e.target.value)}
          rows="3"
          placeholder="Masukkan keterangan jika ada..."
          className="w-full rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:ring-4 focus:ring-orange-500/10"
        />
      </div>
    </article>
  );
}

function NumberInput({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </label>

      <input
        type="number"
        min="0"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-100 bg-white px-4 py-4 text-sm font-black text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:ring-4 focus:ring-orange-500/10"
        placeholder="0"
      />
    </div>
  );
}

function StatusSubmitBadge({ existing }) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-[10px] font-black uppercase tracking-widest ${
        existing
          ? "bg-green-50 text-green-600"
          : "bg-orange-50 text-orange-500"
      }`}
    >
      {existing ? <CheckCircle2 size={16} /> : <Info size={16} />}
      {existing ? "Sudah Mengisi" : "Belum Mengisi"}
    </div>
  );
}

function SummaryBox({ icon, label, value }) {
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

function MiniStat({ icon, label, value }) {
  return (
    <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {label}
        </p>

        <p className="text-[#071E3D] font-black mt-1 truncate">{value}</p>
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

function EmptyState({ title, description }) {
  return (
    <div className="rounded-[30px] border border-dashed border-slate-200 bg-slate-50/60 p-10 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
        <ClipboardCheck size={34} />
      </div>

      <h3 className="text-2xl font-black text-[#071E3D]">{title}</h3>

      <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-relaxed text-slate-500">
        {description}
      </p>
    </div>
  );
}

function EmptySmall({ title, description }) {
  return (
    <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center">
      <CalendarDays size={32} className="mx-auto mb-3 text-slate-300" />

      <p className="text-sm font-black text-[#071E3D]">{title}</p>

      <p className="mt-1 text-xs font-medium text-slate-400">{description}</p>
    </div>
  );
}

function SmallLine({ icon, text }) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
      <span className="text-orange-500">{icon}</span>
      <span className="line-clamp-1">{text || "-"}</span>
    </div>
  );
}

function createEmptyDetail(persyaratanList) {
  return persyaratanList.map((item) => ({
    id_persyaratan_tuk: item.id_persyaratan_tuk || item.id,
    nama_persyaratan:
      item.nama_persyaratan || item.nama || item.persyaratan || item.nama_item,
    kategori: item.kategori || "",
    jumlah_total: "",
    jumlah_baik: "",
    jumlah_rusak: "",
    keterangan: "",
  }));
}

function mergeDetailWithPersyaratan(persyaratanList, existingDetails) {
  return persyaratanList.map((persyaratan) => {
    const idPersyaratan = persyaratan.id_persyaratan_tuk || persyaratan.id;

    const found = existingDetails.find(
      (item) => Number(item.id_persyaratan_tuk) === Number(idPersyaratan)
    );

    return {
      id_persyaratan_tuk: idPersyaratan,
      nama_persyaratan:
        persyaratan.nama_persyaratan ||
        persyaratan.nama ||
        persyaratan.persyaratan ||
        persyaratan.nama_item,
      kategori: persyaratan.kategori || "",
      jumlah_total: found?.jumlah_total ?? "",
      jumlah_baik: found?.jumlah_baik ?? "",
      jumlah_rusak: found?.jumlah_rusak ?? "",
      keterangan: found?.keterangan ?? "",
    };
  });
}

function isSameJadwal(a, b) {
  if (!a || !b) return false;

  return (
    Number(a.id_jadwal) === Number(b.id_jadwal) &&
    Number(a.id_user) === Number(b.id_user) &&
    a.jenis_tugas === b.jenis_tugas
  );
}

function getJadwalId(item) {
  return item?.id_jadwal || item?.jadwal?.id_jadwal || item?.jadwal?.id;
}

function getJadwalTitle(item) {
  const jadwal = item?.jadwal || {};

  return (
    jadwal.nama_kegiatan ||
    jadwal.nama_skema ||
    jadwal.skema?.nama_skema ||
    jadwal.skema?.judul_skema ||
    jadwal.kode_jadwal ||
    "Jadwal Verifikasi TUK"
  );
}

function getJadwalDate(jadwal) {
  return (
    jadwal?.tgl_awal ||
    jadwal?.tanggal ||
    jadwal?.tanggal_uji ||
    jadwal?.tgl_pelaksanaan ||
    jadwal?.tanggal_pelaksanaan ||
    jadwal?.created_at
  );
}

function getJadwalTuk(jadwal) {
  return (
    jadwal?.nama_tuk ||
    jadwal?.tuk?.nama_tuk ||
    jadwal?.tuk?.nama ||
    jadwal?.tempat ||
    jadwal?.lokasi ||
    "Lokasi / TUK belum tersedia"
  );
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

function formatTanggal(value) {
  if (!value) return "-";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatRentangTanggal(start, end) {
  if (!start && !end) return "-";
  if (start && !end) return formatTanggal(start);
  if (!start && end) return formatTanggal(end);

  if (String(start).slice(0, 10) === String(end).slice(0, 10)) {
    return formatTanggal(start);
  }

  return `${formatTanggal(start)} - ${formatTanggal(end)}`;
}

function onlyNumber(value) {
  if (value === "") return "";
  return String(value).replace(/[^\d]/g, "");
}