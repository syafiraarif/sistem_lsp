// frontend/src/pages/Asesi/JadwalSaya.jsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  BadgeCheck,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  CheckCircle,
  ChevronRight,
  CreditCard,
  FileText,
  Filter,
  Inbox,
  Loader2,
  MapPin,
  MonitorCheck,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  XCircle,
  Lock,
} from "lucide-react";

export default function JadwalSaya() {
  const [jadwal, setJadwal] = useState([]);
  const [myJadwal, setMyJadwal] = useState([]);
  const [pembayaran, setPembayaran] = useState({});
  const [apl01Status, setApl01Status] = useState({});
  const [loading, setLoading] = useState(true);
  const [choosingId, setChoosingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("semua");
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const hasLoadedRef = useRef(false);
  const requestRunningRef = useRef(false);

  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

  const getToken = () => localStorage.getItem("token");

  const getHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
  });

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    if (hasLoadedRef.current) return;

    hasLoadedRef.current = true;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      if (!loading && !requestRunningRef.current) {
        loadData(false);
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        handleFocus();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const normalizePesertaJadwal = (item) => {
    const jadwalItem = item.jadwal || item.Jadwal || {};

    return {
      id_peserta:
        item.id_peserta ||
        item.id_peserta_jadwal ||
        item.id ||
        item.id_pendaftaran,

      id_jadwal: item.id_jadwal || jadwalItem.id_jadwal,

      id_skema:
        item.id_skema ||
        jadwalItem.id_skema ||
        jadwalItem.skema?.id_skema ||
        jadwalItem.Skema?.id_skema,

      status:
        item.status ||
        item.status_peserta ||
        item.status_pendaftaran ||
        "menunggu",

      raw: item,
    };
  };

  const normalizePaymentStatus = (status) => {
    const value = String(status || "belum bayar")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_");

    if (value === "belum_bayar") return "belum bayar";
    if (value === "menunggu_validasi_admin") return "menunggu_validasi";
    if (value === "menunggu_validasi") return "menunggu_validasi";
    if (value === "pending") return "pending";
    if (value === "paid") return "paid";
    if (value === "ditolak") return "ditolak";
    if (value === "expired") return "expired";
    if (value === "cancelled") return "cancelled";

    return value || "belum bayar";
  };

  const getIdSkema = (item) => {
    return (
      item.id_skema ||
      item.skema?.id_skema ||
      item.Skema?.id_skema ||
      item.jadwal?.id_skema ||
      item.Jadwal?.id_skema
    );
  };

  const getSelectedJadwal = (id_jadwal) => {
    return myJadwal.find(
      (item) => Number(item.id_jadwal) === Number(id_jadwal)
    );
  };

  const getIdPesertaByJadwal = (id_jadwal) => {
    const selected = getSelectedJadwal(id_jadwal);

    return (
      selected?.id_peserta ||
      selected?.raw?.id_peserta ||
      selected?.raw?.id_peserta_jadwal ||
      selected?.raw?.id ||
      selected?.raw?.id_pendaftaran
    );
  };

  const isSudahDipilih = (id_jadwal) => {
    return myJadwal.some(
      (item) => Number(item.id_jadwal) === Number(id_jadwal)
    );
  };

  const getPembayaranData = (item) => {
    const idSkema = getIdSkema(item);
    return pembayaran[idSkema] || null;
  };

  const getStatusPembayaran = (item) => {
    const data = getPembayaranData(item);

    if (!data) return "belum bayar";

    return normalizePaymentStatus(data.status);
  };

  const loadData = async (showMainLoading = true) => {
    if (requestRunningRef.current) return;

    requestRunningRef.current = true;

    if (showMainLoading) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError("");

    try {
      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const [jadwalRes, sayaRes] = await Promise.all([
        axios.get(`${API}/asesi/jadwal/tersedia`, {
          headers: getHeaders(),
        }),
        axios.get(`${API}/asesi/jadwal-saya`, {
          headers: getHeaders(),
        }),
      ]);

      const jadwalData = jadwalRes.data?.data || [];
      const sayaData = sayaRes.data?.data || [];

      const selected = sayaData
        .map(normalizePesertaJadwal)
        .filter((item) => item.id_jadwal);

      setJadwal(jadwalData);
      setMyJadwal(selected);

      await loadStatusPembayaran(jadwalData);
      await loadStatusAPL01(selected);
    } catch (err) {
      console.error(err);

      if (err.response?.status === 429) {
        setError(
          "Terlalu banyak request ke server. Tunggu sebentar lalu klik Refresh Jadwal."
        );
      } else {
        setError(err.response?.data?.message || "Gagal memuat jadwal.");
      }
    } finally {
      requestRunningRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadStatusPembayaran = async (jadwalData) => {
    const result = {};
    const uniqueSkemaIds = [
      ...new Set(jadwalData.map((item) => getIdSkema(item)).filter(Boolean)),
    ];

    for (const idSkema of uniqueSkemaIds) {
      try {
        const res = await axios.get(
          `${API}/asesi/pembayaran/${idSkema}/status`,
          { headers: getHeaders() }
        );

        const data = res.data?.data || {};

        result[idSkema] = {
          id_pembayaran: data.id_pembayaran || null,
          id_user: data.id_user || null,
          id_peserta: data.id_peserta || null,
          id_skema: data.id_skema || idSkema,
          status: normalizePaymentStatus(data.status),
          metode_pembayaran: data.metode_pembayaran || null,
          jalur_pembayaran: data.jalur_pembayaran || null,
          nominal: data.nominal || 0,
          waktu_batas: data.waktu_batas || null,
          waktu_pembayaran: data.waktu_pembayaran || null,
          bukti_bayar: data.bukti_bayar || null,
          catatan_admin: data.catatan_admin || null,
        };
      } catch (err) {
        result[idSkema] = {
          id_pembayaran: null,
          id_skema: idSkema,
          status: "belum bayar",
          metode_pembayaran: null,
          jalur_pembayaran: null,
          nominal: 0,
          waktu_batas: null,
          waktu_pembayaran: null,
          bukti_bayar: null,
          catatan_admin: null,
        };
      }

      await sleep(80);
    }

    setPembayaran(result);
  };

  const loadStatusAPL01 = async (selectedData) => {
    const result = {};

    for (const item of selectedData) {
      const idPeserta =
        item.id_peserta ||
        item.raw?.id_peserta ||
        item.raw?.id_peserta_jadwal ||
        item.raw?.id ||
        item.raw?.id_pendaftaran;

      if (!idPeserta) continue;

      try {
        const res = await axios.get(`${API}/asesi/apl01/status/${idPeserta}`, {
          headers: getHeaders(),
        });

        result[idPeserta] = {
          exists: Boolean(res.data?.data?.exists),
          submitted: Boolean(res.data?.data?.submitted),
          status: res.data?.data?.status_apl01 || "belum_ada",
          id_apl01: res.data?.data?.id_apl01 || null,
        };
      } catch (err) {
        result[idPeserta] = {
          exists: false,
          submitted: false,
          status: "belum_ada",
          id_apl01: null,
        };
      }

      await sleep(80);
    }

    setApl01Status(result);
  };

  const pilihJadwal = async (id_jadwal) => {
    setChoosingId(id_jadwal);

    try {
      const res = await axios.post(
        `${API}/asesi/jadwal/pilih`,
        { id_jadwal },
        { headers: getHeaders() }
      );

      alert("Jadwal berhasil dipilih. Silakan lanjut pembayaran.");

      const data = res.data?.data || {};

      setMyJadwal((prev) =>
        prev.some((item) => Number(item.id_jadwal) === Number(id_jadwal))
          ? prev
          : [
              ...prev,
              {
                id_peserta:
                  data.id_peserta ||
                  data.id_peserta_jadwal ||
                  data.id ||
                  data.id_pendaftaran,
                id_jadwal,
                id_skema: data.id_skema,
                status: data.status || "menunggu",
                raw: data,
              },
            ]
      );

      await loadData(false);
    } catch (err) {
      const message = err.response?.data?.message;

      if (message?.toLowerCase().includes("sudah terdaftar")) {
        alert("Anda sudah memilih jadwal ini.");
        await loadData(false);
      } else {
        alert(message || "Gagal memilih jadwal.");
      }
    } finally {
      setChoosingId(null);
    }
  };

  const pergiBayar = (item) => {
    const idSkema = getIdSkema(item);
    const statusBayar = getStatusPembayaran(item);

    if (!idSkema) {
      alert("ID skema tidak ditemukan.");
      return;
    }

    if (statusBayar === "pending" || statusBayar === "menunggu_validasi") {
      alert("Pembayaran sedang menunggu validasi admin. Tidak bisa bayar ulang.");
      return;
    }

    if (statusBayar === "paid") {
      alert("Pembayaran sudah diterima admin.");
      return;
    }

    navigate(`/asesi/pembayaran/${idSkema}`);
  };

  const pergiAPL01 = (item) => {
    const idPeserta = getIdPesertaByJadwal(item.id_jadwal);

    if (!idPeserta) {
      alert("ID peserta tidak ditemukan. Silakan klik Refresh lalu coba lagi.");
      return;
    }

    navigate(`/asesi/apl01/${idPeserta}`);
  };

  const pergiAPL02 = (item) => {
    const idSkema = getIdSkema(item);
    const idPeserta = getIdPesertaByJadwal(item.id_jadwal);

    if (!idSkema) {
      alert("ID skema tidak ditemukan.");
      return;
    }

    navigate(`/asesi/apl02/${idSkema}`, {
      state: {
        id_peserta: idPeserta,
      },
    });
  };

  const pergiPresensi = (item) => {
    const idSkema = getIdSkema(item);

    if (!idSkema) {
      alert("ID skema tidak ditemukan.");
      return;
    }

    navigate(`/asesi/pra-asesmen/${idSkema}`);
  };

  const pergiFRIA05 = (item) => {
    const idPeserta = getIdPesertaByJadwal(item.id_jadwal);
    const idJadwal =
      item.id_jadwal || item.jadwal?.id_jadwal || item.Jadwal?.id_jadwal;

    if (!idJadwal) {
      alert("ID jadwal tidak ditemukan.");
      return;
    }

    if (!idPeserta) {
      alert("ID peserta tidak ditemukan. Silakan klik Refresh lalu coba lagi.");
      return;
    }

    navigate(`/asesi/fr-ia05/jadwal/${idJadwal}/${idPeserta}`);
  };

  const pergiHasilAkhir = (item) => {
    const idPeserta = getIdPesertaByJadwal(item.id_jadwal);

    if (!idPeserta) {
      alert("ID peserta tidak ditemukan. Silakan klik Refresh lalu coba lagi.");
      return;
    }

    navigate(`/asesi/hasil-akhir/${idPeserta}`);
  };

  const handleRefresh = async () => {
    await loadData(false);
  };

  const formatTanggal = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "-";

    return parsed.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const filteredJadwal = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return jadwal.filter((item) => {
      const skema = item.skema || item.Skema || {};
      const tuk = item.tuk || item.Tuk || {};
      const sudahDipilih = isSudahDipilih(item.id_jadwal);
      const statusBayar = getStatusPembayaran(item);

      const matchSearch =
        !keyword ||
        skema.judul_skema?.toLowerCase().includes(keyword) ||
        skema.kode_skema?.toLowerCase().includes(keyword) ||
        tuk.nama_tuk?.toLowerCase().includes(keyword) ||
        item.nama_kegiatan?.toLowerCase().includes(keyword) ||
        item.pelaksanaan_uji?.toLowerCase().includes(keyword);

      const matchFilter =
        filter === "semua" ||
        (filter === "dipilih" && sudahDipilih) ||
        (filter === "belum" && !sudahDipilih) ||
        (filter === "validasi" &&
          (statusBayar === "pending" ||
            statusBayar === "menunggu_validasi")) ||
        (filter === "paid" && statusBayar === "paid") ||
        (filter === "ditolak" && statusBayar === "ditolak");

      return matchSearch && matchFilter;
    });
  }, [jadwal, myJadwal, pembayaran, search, filter, apl01Status]);

  const totalDipilih = myJadwal.length;
  const totalPaid = jadwal.filter((item) => getStatusPembayaran(item) === "paid")
    .length;
  const totalMenunggu = jadwal.filter((item) => {
    const status = getStatusPembayaran(item);
    return status === "pending" || status === "menunggu_validasi";
  }).length;
  const totalTersedia = jadwal.length;

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <SidebarAsesi isOpen={isOpen} setIsOpen={setIsOpen} />

      <main className="flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300 overflow-x-hidden">
        <div className="w-full max-w-[1500px] mx-auto space-y-6">
          <section className="relative overflow-hidden rounded-[36px] border border-slate-100 bg-white shadow-sm">
            <div className="absolute top-0 right-0 w-[430px] h-[430px] bg-orange-500/10 rounded-full blur-[110px]" />
            <div className="absolute -bottom-24 -left-24 w-[380px] h-[380px] bg-[#071E3D]/5 rounded-full blur-[100px]" />

            <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6 p-6 lg:p-8">
              <div className="flex flex-col justify-center">
                <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                  <CalendarDays size={15} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                    Jadwal Saya
                  </span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-black leading-tight text-[#071E3D]">
                  Kelola Jadwal
                  <br />
                  <span className="text-orange-500">Sertifikasi Anda</span>
                </h1>

                <p className="mt-5 max-w-2xl text-base lg:text-lg font-medium leading-relaxed text-slate-500">
                  Pilih jadwal uji kompetensi, lanjutkan pembayaran, dan akses
                  APL01, APL02, presensi, FR.IA.05, serta hasil akhir sesuai 
                  dengan tahapan yang berlaku.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {refreshing ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <RefreshCcw size={17} />
                    )}
                    Refresh Jadwal
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/asesi")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-7 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                  >
                    Dashboard
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[32px] bg-[#071E3D] p-6 text-white shadow-2xl shadow-[#071E3D]/15">
                <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />

                <div className="relative z-10 flex flex-col h-full">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-orange-400">
                    <Sparkles size={28} />
                  </div>

                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/50">
                    Ringkasan Jadwal
                  </p>

                  <h2 className="text-2xl font-black leading-tight">
                    {totalTersedia} Jadwal Tersedia
                  </h2>

                  <p className="mt-4 text-sm font-medium leading-relaxed text-white/60">
                    Pantau status jadwal dan pembayaran Anda sebelum lanjut ke
                    proses asesmen.
                  </p>

                  <div className="mt-auto pt-6 grid grid-cols-3 gap-3">
                    <HeroPill label="Dipilih" value={`${totalDipilih}`} />
                    <HeroPill label="Validasi" value={`${totalMenunggu}`} />
                    <HeroPill label="Paid" value={`${totalPaid}`} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {error && <ErrorAlert message={error} />}

          <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <MiniStat
              icon={<CalendarDays size={22} />}
              label="Total Jadwal"
              value={`${totalTersedia} Jadwal`}
            />

            <MiniStat
              icon={<BadgeCheck size={22} />}
              label="Jadwal Dipilih"
              value={`${totalDipilih} Dipilih`}
            />

            <MiniStat
              icon={<CheckCircle size={22} />}
              label="Menunggu Validasi"
              value={`${totalMenunggu} Pembayaran`}
            />
          </section>

          <section className="rounded-[32px] border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                  <Filter size={15} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                    Filter Jadwal
                  </span>
                </div>

                <h2 className="text-xl font-black text-[#071E3D]">
                  Daftar Jadwal Sertifikasi
                </h2>

                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                  Cari berdasarkan skema, kegiatan, TUK, atau pelaksanaan uji
                </p>
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {refreshing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <RefreshCcw size={16} />
                )}
                Muat Ulang
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari skema, kode, kegiatan, atau TUK..."
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-12 py-4 text-sm font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                />
              </div>

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-black text-[#071E3D] outline-none transition-all focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
              >
                <option value="semua">Semua</option>
                <option value="dipilih">Dipilih</option>
                <option value="belum">Belum Dipilih</option>
                <option value="validasi">Menunggu Validasi</option>
                <option value="paid">Paid</option>
                <option value="ditolak">Ditolak</option>
              </select>
            </div>
          </section>

          <section className="space-y-5">
            {filteredJadwal.length === 0 ? (
              <EmptyState search={search} />
            ) : (
              filteredJadwal.map((item, index) => {
                const skema = item.skema || item.Skema || {};
                const tuk = item.tuk || item.Tuk || {};
                const idPeserta = getIdPesertaByJadwal(item.id_jadwal);
                const sudahDipilih = isSudahDipilih(item.id_jadwal);
                const sedangMemilih = choosingId === item.id_jadwal;
                const pembayaranData = getPembayaranData(item);
                const statusBayar = getStatusPembayaran(item);
                const sudahPaid = statusBayar === "paid";
                const menungguValidasi =
                  statusBayar === "pending" ||
                  statusBayar === "menunggu_validasi";
                const pembayaranDitolak = statusBayar === "ditolak";

                return (
                  <ScheduleCard
                    key={item.id_jadwal || index}
                    item={item}
                    skema={skema}
                    tuk={tuk}
                    idPeserta={idPeserta}
                    sudahDipilih={sudahDipilih}
                    sedangMemilih={sedangMemilih}
                    pembayaranData={pembayaranData}
                    statusBayar={statusBayar}
                    sudahPaid={sudahPaid}
                    menungguValidasi={menungguValidasi}
                    pembayaranDitolak={pembayaranDitolak}
                    apl01Data={apl01Status[idPeserta] || {}}
                    formatTanggal={formatTanggal}
                    pilihJadwal={pilihJadwal}
                    pergiBayar={pergiBayar}
                    pergiAPL01={pergiAPL01}
                    pergiAPL02={pergiAPL02}
                    pergiPresensi={pergiPresensi}
                    pergiFRIA05={pergiFRIA05}
                    pergiHasilAkhir={pergiHasilAkhir}
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

function ScheduleCard({
  item,
  skema,
  tuk,
  idPeserta,
  sudahDipilih,
  sedangMemilih,
  pembayaranData,
  statusBayar,
  sudahPaid,
  menungguValidasi,
  pembayaranDitolak,
  apl01Data,
  formatTanggal,
  pilihJadwal,
  pergiBayar,
  pergiAPL01,
  pergiAPL02,
  pergiPresensi,
  pergiFRIA05,
  pergiHasilAkhir,
}) {
  const title = skema.judul_skema || "Skema tidak tersedia";
  const kodeSkema = skema.kode_skema || "SKEMA";
  const kegiatan = item.nama_kegiatan || "Jadwal uji kompetensi";
  const idJadwal = item.id_jadwal;
  const tanggal = `${formatTanggal(item.tgl_awal)} - ${formatTanggal(
    item.tgl_akhir
  )}`;

  // ================= LOGIKA ALUR KERJA (WORKFLOW GATES) =================
  const isApl01Done = apl01Data?.submitted || apl01Data?.exists;
  
  // Status Validasi APL01 dari Backend
  const statusApl01 = String(apl01Data?.status || "").toLowerCase();
  const isApl01Valid = ["diterima", "valid", "memenuhi_syarat", "selesai"].includes(statusApl01);

  // Cek pencocokan tanggal hari H dengan tanggal jadwal ujian (Presensi hanya terbuka di hari H)
  let isHariH = false;
  const tglUjian = item.tgl_awal || item.waktu_pelaksanaan || item.jadwal?.tgl_awal;
  if (tglUjian) {
    const hariIni = new Date();
    const hariH = new Date(tglUjian);
    if (!isNaN(hariH.getTime())) {
      isHariH = hariIni.getFullYear() === hariH.getFullYear() &&
                hariIni.getMonth() === hariH.getMonth() &&
                hariIni.getDate() === hariH.getDate();
    }
  }

  // Syarat pembukaan tombol:
  const unlockApl02 = isApl01Done; // Terbuka apabila APL01 sudah dikerjakan
  const unlockHasilAkhir = item.status_asesmen === "kompeten" || item.status_asesmen === "belum_kompeten";
  // ======================================================================

  return (
    <article className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm transition-all hover:shadow-xl hover:shadow-orange-500/5">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_330px]">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-orange-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-orange-500">
                  {kodeSkema}
                </span>

                {sudahDipilih ? (
                  <StatusBadge type="success" label="Dipilih" />
                ) : (
                  <StatusBadge type="light" label="Tersedia" />
                )}

                {menungguValidasi && (
                  <StatusBadge type="warning" label="Menunggu Validasi" />
                )}

                {sudahPaid && <StatusBadge type="success" label="Paid" />}

                {pembayaranDitolak && (
                  <StatusBadge type="danger" label="Ditolak" />
                )}

                {isApl01Done && (
                  <StatusBadge type="success" label="APL01 Selesai" />
                )}
              </div>

              <h3 className="text-2xl font-black text-[#071E3D]">{title}</h3>

              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
                {kegiatan}
              </p>
            </div>

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
              <BookOpen size={26} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <DetailItem
              icon={<MapPin size={18} />}
              label="TUK"
              value={tuk.nama_tuk || "-"}
            />

            <DetailItem
              icon={<MonitorCheck size={18} />}
              label="Pelaksanaan"
              value={item.pelaksanaan_uji || "-"}
            />

            <DetailItem
              icon={<CalendarCheck size={18} />}
              label="Tanggal"
              value={tanggal}
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-bold text-slate-400">
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2">
              <Tag size={14} />
              ID Jadwal: {idJadwal || "-"}
            </span>

            {sudahDipilih && (
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2">
                <Tag size={14} />
                ID Peserta: {idPeserta || "-"}
              </span>
            )}

            {pembayaranData?.id_pembayaran && (
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2">
                <Tag size={14} />
                ID Pembayaran: {pembayaranData.id_pembayaran}
              </span>
            )}
          </div>
        </div>

        <div className="border-t xl:border-t-0 xl:border-l border-slate-100 bg-slate-50/60 p-6 flex flex-col justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Aksi Jadwal
            </p>

            <h4 className="mt-2 text-lg font-black text-[#071E3D]">
              Kelola Proses
            </h4>

            <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
              Pilih jadwal, lakukan pembayaran, lalu lanjutkan pengisian form
              asesmen secara berurutan sesuai alur.
            </p>
          </div>

          {!sudahDipilih ? (
            <button
              disabled={sedangMemilih}
              onClick={() => pilihJadwal(item.id_jadwal)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {sedangMemilih ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Memilih
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  Pilih Jadwal
                </>
              )}
            </button>
          ) : menungguValidasi ? (
            <button
              type="button"
              disabled
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4 text-xs font-black uppercase tracking-widest text-amber-700 cursor-not-allowed"
            >
              <Loader2 size={16} className="animate-spin" />
              Menunggu Validasi Admin
            </button>
          ) : pembayaranDitolak ? (
            <div className="grid grid-cols-1 gap-3">
              <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-[11px] font-bold text-red-700 leading-relaxed">
                Pembayaran ditolak admin.
                {pembayaranData?.catatan_admin
                  ? ` Catatan: ${pembayaranData.catatan_admin}`
                  : " Silakan lakukan pembayaran ulang."}
              </div>

              <button
                type="button"
                onClick={() => pergiBayar(item)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
              >
                <CreditCard size={16} />
                Bayar Ulang
              </button>
            </div>
          ) : sudahPaid ? (
            <div className="grid grid-cols-1 gap-3">
              <ActionButton 
                title={isApl01Done ? "Lihat APL01" : "Isi APL01"} 
                onClick={() => pergiAPL01(item)} 
              />

              {unlockApl02 ? (
                <ActionButton 
                  title="Isi / Lihat APL02" 
                  onClick={() => pergiAPL02(item)} 
                />
              ) : (
                <LockedMessage text="APL02 akan tersedia setelah APL01 selesai disubmit." />
              )}

              {/* Syarat Presensi: APL01 dan APL02 harus Valid + Wajib Hari H */}
              {isApl01Valid ? (
                isHariH ? (
                  <ActionButton
                    title="Presensi Ujian"
                    onClick={() => pergiPresensi(item)}
                  />
                ) : (
                  <LockedMessage text={`Presensi baru akan dibuka pada tanggal pelaksanaan ujian (${formatTanggal(tglUjian)}).`} />
                )
              ) : (
                <LockedMessage text="Presensi terkunci. Menunggu Asesor memvalidasi persyaratan APL01 & APL02 Anda." />
              )}

              {/* Syarat FR.IA.05: Harus di Hari H dan Berkas Valid */}
              {isApl01Valid && isHariH ? (
                <ActionButton
                  title="Mulai FR.IA.05"
                  onClick={() => pergiFRIA05(item)}
                />
              ) : (
                <LockedMessage text="Ujian FR.IA.05 akan terbuka otomatis setelah Anda melakukan Presensi di hari H." />
              )}

              {unlockHasilAkhir ? (
                <ActionButton
                  title="Lihat Hasil Akhir"
                  onClick={() => pergiHasilAkhir(item)}
                />
              ) : (
                <LockedMessage text="Hasil akhir akan diumumkan setelah asesor menyelesaikan penilaian FR.IA.05." />
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => pergiBayar(item)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
            >
              <CreditCard size={16} />
              Bayar Sekarang
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-5">
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl p-10 text-center max-w-sm w-full">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#071E3D] flex items-center justify-center mb-5">
          <Loader2 className="animate-spin text-white" size={34} />
        </div>

        <h2 className="text-[#071E3D] font-black text-xl">Memuat Jadwal</h2>

        <p className="text-slate-500 text-sm mt-2 font-medium">
          Mengambil data jadwal sertifikasi Anda.
        </p>
      </div>
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

function StatusBadge({ type = "light", label }) {
  const styles = {
    success: "bg-green-50 text-green-600",
    warning: "bg-amber-50 text-amber-600",
    danger: "bg-red-50 text-red-600",
    light: "bg-slate-50 text-slate-500",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest ${
        styles[type] || styles.light
      }`}
    >
      {label}
    </span>
  );
}

function DetailItem({ icon, label, value }) {
  return (
    <div className="rounded-[24px] border border-slate-100 bg-slate-50/70 p-4">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-orange-500">
        {icon}
      </div>

      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-[#071E3D] line-clamp-2 capitalize">
        {value || "-"}
      </p>
    </div>
  );
}

function ActionButton({ title, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-white px-5 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
    >
      <FileText size={16} />
      {title}
    </button>
  );
}

function LockedMessage({ text }) {
  return (
    <div className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-[11px] font-bold text-slate-500 text-center leading-relaxed">
      <Lock size={14} className="shrink-0 text-slate-400" />
      {text}
    </div>
  );
}

function ErrorAlert({ message }) {
  return (
    <div className="rounded-[24px] border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold flex items-center gap-3 text-red-600">
      <AlertCircle size={20} className="shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function EmptyState({ search }) {
  return (
    <div className="rounded-[32px] border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
        {search ? <XCircle size={30} /> : <Inbox size={30} />}
      </div>

      <h3 className="text-2xl font-black text-[#071E3D]">
        {search ? "Jadwal Tidak Ditemukan" : "Belum Ada Jadwal"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-relaxed text-slate-500">
        {search
          ? "Coba gunakan kata kunci lain untuk mencari jadwal sertifikasi."
          : "Saat ini belum ada jadwal sertifikasi yang tersedia."}
      </p>
    </div>
  );
}