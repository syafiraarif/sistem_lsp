// frontend/src/pages/asesi/JadwalSaya.jsx

import React, { useEffect, useMemo, useState } from "react";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  CheckCircle,
  ChevronRight,
  Clock,
  CreditCard,
  FileText,
  Inbox,
  Loader2,
  MapPin,
  MonitorCheck,
  RefreshCcw,
  Search,
  ShieldCheck,
  Tag,
  Users,
  XCircle,
} from "lucide-react";

export default function JadwalSaya() {
  const [jadwal, setJadwal] = useState([]);
  const [myJadwal, setMyJadwal] = useState([]);
  const [pembayaran, setPembayaran] = useState({});
  const [loading, setLoading] = useState(true);
  const [choosingId, setChoosingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("semua");
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_BASE;

  const getToken = () => localStorage.getItem("token");

  const getHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const normalizePesertaJadwal = (item) => {
    const jadwalItem = item.jadwal || item.Jadwal || {};

    return {
      id_peserta:
        item.id_peserta ||
        item.id_peserta_jadwal ||
        item.id ||
        item.id_pendaftaran,

      id_jadwal:
        item.id_jadwal ||
        jadwalItem.id_jadwal,

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

  const loadData = async () => {
    setLoading(true);
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

      setJadwal(jadwalData);

      const selected = sayaData
        .map(normalizePesertaJadwal)
        .filter((item) => item.id_jadwal);

      setMyJadwal(selected);

      await loadStatusPembayaran(jadwalData);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Gagal memuat jadwal.");
    } finally {
      setLoading(false);
    }
  };

  const loadStatusPembayaran = async (jadwalData) => {
    const result = {};

    await Promise.all(
      jadwalData.map(async (item) => {
        const idSkema = getIdSkema(item);

        if (!idSkema) return;

        try {
          const res = await axios.get(
            `${API}/asesi/pembayaran/${idSkema}/status`,
            { headers: getHeaders() }
          );

          result[idSkema] = res.data?.data?.status || "belum bayar";
        } catch (err) {
          result[idSkema] = "belum bayar";
        }
      })
    );

    setPembayaran(result);
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

  const getStatusPembayaran = (item) => {
    const idSkema = getIdSkema(item);
    return pembayaran[idSkema] || "belum bayar";
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

      await loadData();
    } catch (err) {
      const message = err.response?.data?.message;

      if (message?.toLowerCase().includes("sudah terdaftar")) {
        alert("Anda sudah memilih jadwal ini.");
        await loadData();
      } else {
        alert(message || "Gagal memilih jadwal.");
      }
    } finally {
      setChoosingId(null);
    }
  };

  const pergiBayar = (item) => {
    const idSkema = getIdSkema(item);

    if (!idSkema) {
      alert("ID skema tidak ditemukan.");
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

    if (!idSkema) {
      alert("ID skema tidak ditemukan.");
      return;
    }

    navigate(`/asesi/apl02/${idSkema}`);
  };

  const pergiPraAsesmen = (item) => {
    const idSkema = getIdSkema(item);

    if (!idSkema) {
      alert("ID skema tidak ditemukan.");
      return;
    }

    navigate(`/asesi/pra-asesmen/${idSkema}`);
  };

  const formatTanggal = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "-";

    return parsed.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
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
        (filter === "paid" && statusBayar === "paid");

      return matchSearch && matchFilter;
    });
  }, [jadwal, myJadwal, pembayaran, search, filter]);

  const totalDipilih = myJadwal.length;

  const totalPaid = jadwal.filter((item) => getStatusPembayaran(item) === "paid")
    .length;

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#EEF2F7] flex">
      <SidebarAsesi isOpen={isOpen} setIsOpen={setIsOpen} />

      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <HeaderSection
            totalJadwal={jadwal.length}
            totalDipilih={totalDipilih}
            totalPaid={totalPaid}
          />

          <FilterSection
            search={search}
            setSearch={setSearch}
            filter={filter}
            setFilter={setFilter}
            loadData={loadData}
          />

          {error && <ErrorAlert message={error} />}

          {filteredJadwal.length === 0 ? (
            <EmptyState search={search} />
          ) : (
            <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {filteredJadwal.map((item) => {
                const skema = item.skema || item.Skema || {};
                const tuk = item.tuk || item.Tuk || {};
                const idSkema = getIdSkema(item);
                const idPeserta = getIdPesertaByJadwal(item.id_jadwal);
                const sudahDipilih = isSudahDipilih(item.id_jadwal);
                const sedangMemilih = choosingId === item.id_jadwal;
                const statusBayar = getStatusPembayaran(item);
                const sudahPaid = statusBayar === "paid";

                return (
                  <ScheduleCard
                    key={item.id_jadwal}
                    item={item}
                    skema={skema}
                    tuk={tuk}
                    idSkema={idSkema}
                    idPeserta={idPeserta}
                    sudahDipilih={sudahDipilih}
                    sedangMemilih={sedangMemilih}
                    statusBayar={statusBayar}
                    sudahPaid={sudahPaid}
                    formatTanggal={formatTanggal}
                    pilihJadwal={pilihJadwal}
                    pergiBayar={pergiBayar}
                    pergiAPL01={pergiAPL01}
                    pergiAPL02={pergiAPL02}
                    pergiPraAsesmen={pergiPraAsesmen}
                  />
                );
              })}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-[#EEF2F7] flex items-center justify-center px-5">
      <div className="bg-white rounded-[28px] border border-slate-200 shadow-lg p-10 text-center max-w-sm w-full">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#071E3D] flex items-center justify-center mb-5">
          <Loader2 className="animate-spin text-white" size={34} />
        </div>

        <h2 className="text-[#071E3D] font-bold text-lg">Memuat Jadwal</h2>

        <p className="text-slate-500 text-sm mt-2">
          Mengambil data jadwal Anda.
        </p>
      </div>
    </div>
  );
};

const HeaderSection = ({ totalJadwal, totalDipilih, totalPaid }) => {
  return (
    <section className="overflow-hidden rounded-[30px] bg-white border border-slate-200 shadow-md">
      <div className="bg-[#071E3D] px-6 lg:px-8 py-7">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1.5 mb-4">
              <CalendarDays size={14} className="text-orange-400" />
              <span className="text-white/80 text-xs font-semibold">
                Dashboard Asesi
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Jadwal Saya
            </h1>

            <p className="text-slate-300 mt-2 text-sm">
              Kelola jadwal, pembayaran, dan formulir asesmen.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Jadwal" value={totalJadwal} />
            <StatCard label="Dipilih" value={totalDipilih} />
            <StatCard label="Paid" value={totalPaid} />
          </div>
        </div>
      </div>

      <div className="h-2 bg-orange-500" />
    </section>
  );
};

const FilterSection = ({
  search,
  setSearch,
  filter,
  setFilter,
  loadData,
}) => {
  return (
    <section className="bg-white rounded-[28px] border border-slate-200 shadow-md p-4">
      <div className="flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between">
        <div className="relative flex-1">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari skema, kegiatan, atau TUK..."
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200 outline-none text-sm font-medium text-[#071E3D] placeholder:text-slate-400 focus:bg-white focus:border-[#071E3D] transition"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterButton
            active={filter === "semua"}
            onClick={() => setFilter("semua")}
          >
            Semua
          </FilterButton>

          <FilterButton
            active={filter === "dipilih"}
            onClick={() => setFilter("dipilih")}
          >
            Dipilih
          </FilterButton>

          <FilterButton
            active={filter === "belum"}
            onClick={() => setFilter("belum")}
          >
            Belum
          </FilterButton>

          <FilterButton
            active={filter === "paid"}
            onClick={() => setFilter("paid")}
          >
            Paid
          </FilterButton>

          <button
            onClick={loadData}
            className="px-4 py-3 rounded-2xl bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 transition inline-flex items-center gap-2"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>
      </div>
    </section>
  );
};

const ScheduleCard = ({
  item,
  skema,
  tuk,
  idPeserta,
  sudahDipilih,
  sedangMemilih,
  statusBayar,
  sudahPaid,
  formatTanggal,
  pilihJadwal,
  pergiBayar,
  pergiAPL01,
  pergiAPL02,
  pergiPraAsesmen,
}) => {
  return (
    <article className="bg-white rounded-[28px] border border-slate-200 shadow-md hover:shadow-lg transition overflow-hidden">
      <div className="bg-[#071E3D] px-5 lg:px-6 py-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 text-orange-400 flex items-center justify-center shrink-0">
            <BookOpen size={25} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="code">{skema.kode_skema || "SKEMA"}</Badge>

              {sudahDipilih ? (
                <Badge variant="success">
                  <CheckCircle size={13} />
                  Dipilih
                </Badge>
              ) : (
                <Badge variant="light">
                  <Clock size={13} />
                  Tersedia
                </Badge>
              )}

              {statusBayar === "pending" && (
                <Badge variant="warning">Menunggu ACC</Badge>
              )}

              {statusBayar === "paid" && (
                <Badge variant="success">
                  <CheckCircle size={13} />
                  Paid
                </Badge>
              )}
            </div>

            <h2 className="text-lg lg:text-xl font-bold text-white leading-snug">
              {skema.judul_skema || "Skema tidak tersedia"}
            </h2>

            <p className="text-slate-300 text-sm mt-1">
              {item.nama_kegiatan || "Jadwal uji kompetensi"}
            </p>
          </div>
        </div>
      </div>

      <div className="h-1.5 bg-orange-500" />

      <div className="p-5 lg:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InfoItem
            icon={<MapPin size={17} />}
            label="TUK"
            value={tuk.nama_tuk || "-"}
          />

          <InfoItem
            icon={<MonitorCheck size={17} />}
            label="Pelaksanaan"
            value={item.pelaksanaan_uji || "-"}
          />

          <InfoItem
            icon={<CalendarDays size={17} />}
            label="Tanggal"
            value={`${formatTanggal(item.tgl_awal)} - ${formatTanggal(
              item.tgl_akhir
            )}`}
          />

          <InfoItem
            icon={<Users size={17} />}
            label="Kuota"
            value={`${item.kuota || 0} peserta`}
          />
        </div>
      </div>

      <div className="px-5 lg:px-6 py-4 bg-[#F8FAFC] border-t border-slate-200 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-semibold">
          <span className="inline-flex items-center gap-2">
            <Tag size={14} />
            ID Jadwal: {item.id_jadwal || "-"}
          </span>

          {sudahDipilih && (
            <span className="inline-flex items-center gap-2">
              <Tag size={14} />
              ID Peserta: {idPeserta || "-"}
            </span>
          )}
        </div>

        {!sudahDipilih ? (
          <button
            disabled={sedangMemilih}
            onClick={() => pilihJadwal(item.id_jadwal)}
            className="w-full sm:w-fit px-5 py-3 rounded-2xl bg-[#071E3D] hover:bg-orange-500 text-white font-semibold text-sm transition inline-flex items-center justify-center gap-2"
          >
            {sedangMemilih ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Memilih
              </>
            ) : (
              <>
                <ShieldCheck size={17} />
                Pilih Jadwal
                <ChevronRight size={16} />
              </>
            )}
          </button>
        ) : sudahPaid ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ActionButton title="APL01" onClick={() => pergiAPL01(item)} />
            <ActionButton title="APL02" onClick={() => pergiAPL02(item)} />
            <ActionButton
              title="Pra Asesmen"
              onClick={() => pergiPraAsesmen(item)}
            />
          </div>
        ) : (
          <button
            onClick={() => pergiBayar(item)}
            className="w-full sm:w-fit px-5 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition inline-flex items-center justify-center gap-2"
          >
            <CreditCard size={17} />
            Bayar Sekarang
          </button>
        )}
      </div>
    </article>
  );
};

const StatCard = ({ label, value }) => {
  return (
    <div className="min-w-[92px] rounded-2xl bg-white/10 border border-white/15 p-4 text-white">
      <p className="text-xs text-slate-300 font-medium">{label}</p>
      <h3 className="text-2xl font-bold mt-1">{value}</h3>
    </div>
  );
};

const FilterButton = ({ active, onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 rounded-2xl font-semibold text-sm transition ${
        active
          ? "bg-[#071E3D] text-white"
          : "bg-[#F8FAFC] text-slate-600 border border-slate-200 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
};

const Badge = ({ variant = "light", children }) => {
  const variants = {
    code: "bg-orange-500 text-white border-orange-500",
    success: "bg-emerald-500 text-white border-emerald-500",
    warning: "bg-amber-400 text-[#071E3D] border-amber-400",
    light: "bg-white/10 text-white border-white/20",
  };

  return (
    <span
      className={`px-3 py-1.5 rounded-full border text-xs font-semibold inline-flex items-center gap-1.5 ${
        variants[variant] || variants.light
      }`}
    >
      {children}
    </span>
  );
};

const InfoItem = ({ icon, label, value }) => {
  return (
    <div className="rounded-2xl bg-[#F8FAFC] border border-slate-200 p-4">
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-[#071E3D] flex items-center justify-center shrink-0">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs text-slate-400 font-semibold mb-1">{label}</p>

          <p className="text-sm font-semibold text-[#071E3D] leading-snug capitalize break-words">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

const ActionButton = ({ title, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="px-4 py-3 rounded-2xl bg-[#071E3D] hover:bg-orange-500 text-white font-semibold text-sm transition inline-flex items-center justify-center gap-2"
    >
      <FileText size={17} />
      {title}
    </button>
  );
};

const ErrorAlert = ({ message }) => {
  return (
    <div className="rounded-[24px] bg-red-50 border border-red-100 p-5 flex gap-3 items-start shadow-sm">
      <AlertCircle className="text-red-500 shrink-0" size={22} />

      <div>
        <h3 className="font-bold text-red-700">Terjadi Kesalahan</h3>
        <p className="text-red-500 text-sm mt-1">{message}</p>
      </div>
    </div>
  );
};

const EmptyState = ({ search }) => {
  return (
    <section className="bg-white rounded-[28px] border border-slate-200 shadow-md overflow-hidden">
      <div className="bg-[#071E3D] px-6 py-5">
        <h2 className="text-white text-xl font-bold">
          {search ? "Jadwal Tidak Ditemukan" : "Belum Ada Jadwal"}
        </h2>
      </div>

      <div className="h-1.5 bg-orange-500" />

      <div className="p-10 lg:p-14 text-center">
        <div className="w-20 h-20 rounded-3xl bg-[#F8FAFC] border border-slate-200 flex items-center justify-center mx-auto mb-5">
          {search ? (
            <XCircle className="text-slate-400" size={40} />
          ) : (
            <Inbox className="text-slate-400" size={40} />
          )}
        </div>

        <p className="text-slate-500 text-sm max-w-md mx-auto">
          {search
            ? "Coba gunakan kata kunci lain."
            : "Saat ini belum ada jadwal sertifikasi yang tersedia."}
        </p>
      </div>
    </section>
  );
};