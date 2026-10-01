import React, { useEffect, useMemo, useState } from "react";
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
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
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
import { notifikasi } from "../../components/ui/notifikasi";

export default function JadwalAsesi() {
  const [jadwal, setJadwal] = useState([]);
  const [myJadwal, setMyJadwal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [choosingId, setChoosingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("semua");
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 3;

  const navigate = useNavigate();

  const API =
    import.meta.env.VITE_API_BASE ||
    "http://localhost:3000/api";

  const getToken = () => localStorage.getItem("token");

  const getHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  const normalizePesertaJadwal = (item) => {
    const jadwalItem =
      item.jadwal ||
      item.Jadwal ||
      {};

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

  const loadData = async (showSuccess = false) => {
    try {
      if (showSuccess) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const [jadwalRes, sayaRes] =
        await Promise.all([
          axios.get(
            `${API}/asesi/jadwal/tersedia`,
            {
              headers: getHeaders(),
            }
          ),
          axios.get(
            `${API}/asesi/jadwal-saya`,
            {
              headers: getHeaders(),
            }
          ),
        ]);

      const jadwalData =
        Array.isArray(jadwalRes.data?.data)
          ? jadwalRes.data.data
          : [];

      const sayaData =
        Array.isArray(sayaRes.data?.data)
          ? sayaRes.data.data
          : [];

      const selected =
        sayaData
          .map(normalizePesertaJadwal)
          .filter(
            (item) => item.id_jadwal
          );

      setJadwal(jadwalData);
      setMyJadwal(selected);
      setCurrentPage(1);

      if (showSuccess) {
        await notifikasi.sukses(
          "Berhasil",
          "Data jadwal sertifikasi berhasil diperbarui."
        );
      }
    } catch (err) {
      console.error(
        "LOAD JADWAL ERROR:",
        err
      );

      const message =
        err.response?.data?.message ||
        "Gagal memuat jadwal sertifikasi.";

      setError(message);

      if (showSuccess) {
        await notifikasi.gagal(
          "Gagal",
          message
        );
      } else {
        await notifikasi.peringatan(
          "Data Tidak Tersedia",
          message
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
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

  const getSelectedJadwal = (
    idJadwal
  ) => {
    return myJadwal.find(
      (item) =>
        Number(item.id_jadwal) ===
        Number(idJadwal)
    );
  };

  const getIdPesertaByJadwal = (
    idJadwal
  ) => {
    const selected =
      getSelectedJadwal(idJadwal);

    return (
      selected?.id_peserta ||
      selected?.raw?.id_peserta ||
      selected?.raw?.id_peserta_jadwal ||
      selected?.raw?.id ||
      selected?.raw?.id_pendaftaran
    );
  };

  const isSudahDipilih = (
    idJadwal
  ) => {
    return myJadwal.some(
      (item) =>
        Number(item.id_jadwal) ===
        Number(idJadwal)
    );
  };

  const pilihJadwal = async (
    idJadwal
  ) => {
    setChoosingId(idJadwal);

    try {
      const res =
        await axios.post(
          `${API}/asesi/jadwal/pilih`,
          {
            id_jadwal: idJadwal,
          },
          {
            headers:
              getHeaders(),
          }
        );

      const data =
        res.data?.data || {};

      setMyJadwal((prev) =>
        prev.some(
          (item) =>
            Number(item.id_jadwal) ===
            Number(idJadwal)
        )
          ? prev
          : [
              ...prev,
              {
                id_peserta:
                  data.id_peserta ||
                  data.id_peserta_jadwal ||
                  data.id ||
                  data.id_pendaftaran,

                id_jadwal:
                  idJadwal,

                id_skema:
                  data.id_skema,

                status:
                  data.status ||
                  "menunggu",

                raw: data,
              },
            ]
      );

      await notifikasi.sukses(
        "Jadwal Berhasil Dipilih",
        "Jadwal sertifikasi berhasil dipilih."
      );

      await loadData(false);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "";

      if (
        message
          .toLowerCase()
          .includes(
            "sudah terdaftar"
          )
      ) {
        await notifikasi.peringatan(
          "Jadwal Sudah Dipilih",
          "Anda sudah terdaftar pada jadwal ini."
        );

        await loadData(false);
      } else if (
        err.response?.status ===
        429
      ) {
        await notifikasi.peringatan(
          "Terlalu Banyak Request",
          "Tunggu beberapa saat lalu coba kembali."
        );
      } else {
        await notifikasi.gagal(
          "Gagal Memilih Jadwal",
          message ||
            "Gagal memilih jadwal."
        );
      }
    } finally {
      setChoosingId(null);
    }
  };

  const formatTanggal = (
    date
  ) => {
    if (!date) {
      return "-";
    }

    const parsed =
      new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return "-";
    }

    return parsed.toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  };

  const filteredJadwal =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      return jadwal.filter(
        (item) => {
          const skema =
            item.skema ||
            item.Skema ||
            {};

          const tuk =
            item.tuk ||
            item.Tuk ||
            {};

          const sudahDipilih =
            isSudahDipilih(
              item.id_jadwal
            );

          const searchableText = [
            skema.judul_skema,
            skema.nama_skema,
            skema.kode_skema,
            tuk.nama_tuk,
            tuk.nama,
            item.nama_kegiatan,
            item.pelaksanaan_uji,
            item.tempat,
            item.lokasi,
            item.status,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          const matchSearch =
            !keyword ||
            searchableText.includes(
              keyword
            );

          const matchFilter =
            filter === "semua" ||
            (filter ===
              "dipilih" &&
              sudahDipilih) ||
            (filter ===
              "belum" &&
              !sudahDipilih);

          return (
            matchSearch &&
            matchFilter
          );
        }
      );
    }, [
      jadwal,
      myJadwal,
      search,
      filter,
    ]);

  const totalTersedia =
    jadwal.length;

  const totalDipilih =
    myJadwal.length;

  const totalBelumDipilih =
    jadwal.filter(
      (item) =>
        !isSudahDipilih(
          item.id_jadwal
        )
    ).length;

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredJadwal.length /
        itemsPerPage
    )
  );

  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages
    );

  const startIndex =
    (safeCurrentPage - 1) *
    itemsPerPage;

  const currentJadwal =
    filteredJadwal.slice(
      startIndex,
      startIndex +
        itemsPerPage
    );

  useEffect(() => {
    if (
      currentPage >
      totalPages
    ) {
      setCurrentPage(
        totalPages
      );
    }
  }, [
    currentPage,
    totalPages,
  ]);

  const handleRefresh =
    async () => {
      await loadData(true);
    };

  if (loading) {
    return (
      <LoadingScreen />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <SidebarAsesi
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

      <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-[1500px] space-y-5">
          <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
            <div className="border-b border-[#071E3D]/10 px-5 py-5 md:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="mb-3 h-1 w-10 rounded-full bg-[#CC6B27]" />

                  <h1 className="text-[24px] font-black text-[#071E3D] md:text-[28px]">
                    Pilih{" "}
                    <span className="text-[#CC6B27]">
                      Jadwal
                    </span>
                  </h1>

                  <p className="mt-1 max-w-3xl text-[13px] font-medium leading-5 text-[#182D4A]/70">
                    Pilih jadwal uji kompetensi
                    yang tersedia sesuai dengan
                    skema sertifikasi yang akan
                    Anda ikuti.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/asesi"
                      )
                    }
                    className="rounded-lg border border-[#071E3D]/20 bg-white px-4 py-2.5 text-[12px] font-bold text-[#071E3D] shadow-sm transition-all hover:border-[#071E3D] hover:bg-[#071E3D] hover:text-white"
                  >
                    Dashboard
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleRefresh
                    }
                    disabled={
                      refreshing
                    }
                    className="rounded-lg border border-[#071E3D]/20 bg-white px-4 py-2.5 text-[12px] font-bold text-[#071E3D] shadow-sm transition-all hover:border-[#071E3D] hover:bg-[#071E3D] hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <span className="flex items-center justify-center gap-2">
                      {refreshing ? (
                        <Loader2
                          size={15}
                          className="animate-spin"
                        />
                      ) : (
                        <RefreshCcw
                          size={15}
                        />
                      )}
                      Refresh
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3 md:p-6">
              <StatCard
                icon={
                  <CalendarDays
                    size={22}
                  />
                }
                label="Total Jadwal"
                value={`${totalTersedia} Jadwal`}
                tone="orange"
              />

              <StatCard
                icon={
                  <BadgeCheck
                    size={22}
                  />
                }
                label="Jadwal Dipilih"
                value={`${totalDipilih} Dipilih`}
                tone="green"
              />

              <StatCard
                icon={
                  <Clock
                    size={22}
                  />
                }
                label="Belum Dipilih"
                value={`${totalBelumDipilih} Tersedia`}
                tone="orange"
              />
            </div>
          </section>

          {error && (
            <ErrorAlert
              message={error}
            />
          )}

          <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
            <div className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-5 py-3.5 md:px-6">
              <h2 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-white">
                <CalendarCheck
                  size={17}
                  className="text-[#CC6B27]"
                />
                Daftar Jadwal Sertifikasi
              </h2>
            </div>

            <div className="border-b border-[#071E3D]/10 bg-white px-5 py-4 md:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[12px] font-medium text-[#182D4A]/60">
                    Cari berdasarkan skema,
                    kegiatan, TUK, atau
                    pelaksanaan uji.
                  </p>

                  <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-[#182D4A]/40">
                    {filteredJadwal.length}{" "}
                    jadwal ditemukan
                  </p>
                </div>

                <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                  <div className="group relative w-full sm:w-[310px]">
                    <Search
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 transition-colors group-focus-within:text-[#CC6B27]"
                    />

                    <input
                      type="text"
                      value={
                        search
                      }
                      onChange={(e) =>
                        setSearch(
                          e.target
                            .value
                        )
                      }
                      placeholder="Cari Jadwal, Skema, TUK..."
                      className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] py-2.5 pl-10 pr-4 text-[13px] font-medium text-[#071E3D] outline-none transition-all placeholder:text-[#182D4A]/40 focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
                    />
                  </div>

                  <select
                    value={
                      filter
                    }
                    onChange={(e) =>
                      setFilter(
                        e.target
                          .value
                      )
                    }
                    className="rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-4 py-2.5 text-[13px] font-bold text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:bg-white"
                  >
                    <option value="semua">
                      Semua Jadwal
                    </option>
                    <option value="belum">
                      Belum Dipilih
                    </option>
                    <option value="dipilih">
                      Sudah Dipilih
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-5 md:p-6">
              {currentJadwal.length ===
              0 ? (
                <EmptyState
                  search={
                    search
                  }
                />
              ) : (
                <div className="space-y-3">
                  {currentJadwal.map(
                    (
                      item,
                      index
                    ) => {
                      const skema =
                        item.skema ||
                        item.Skema ||
                        {};

                      const tuk =
                        item.tuk ||
                        item.Tuk ||
                        {};

                      const idSkema =
                        getIdSkema(
                          item
                        );

                      const idPeserta =
                        getIdPesertaByJadwal(
                          item.id_jadwal
                        );

                      const sudahDipilih =
                        isSudahDipilih(
                          item.id_jadwal
                        );

                      const sedangMemilih =
                        choosingId ===
                        item.id_jadwal;

                      return (
                        <ScheduleCard
                          key={
                            item.id_jadwal ||
                            index
                          }
                          item={
                            item
                          }
                          skema={
                            skema
                          }
                          tuk={
                            tuk
                          }
                          idSkema={
                            idSkema
                          }
                          idPeserta={
                            idPeserta
                          }
                          sudahDipilih={
                            sudahDipilih
                          }
                          sedangMemilih={
                            sedangMemilih
                          }
                          formatTanggal={
                            formatTanggal
                          }
                          pilihJadwal={
                            pilihJadwal
                          }
                          navigate={
                            navigate
                          }
                        />
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </section>

          {filteredJadwal.length >
            0 && (
            <Pagination
              currentPage={
                safeCurrentPage
              }
              totalPages={
                totalPages
              }
              totalItems={
                filteredJadwal.length
              }
              itemsPerPage={
                itemsPerPage
              }
              onPageChange={
                setCurrentPage
              }
            />
          )}
        </div>
      </main>
    </div>
  );
}

function ScheduleCard({
  item,
  skema,
  tuk,
  idSkema,
  idPeserta,
  sudahDipilih,
  sedangMemilih,
  formatTanggal,
  pilihJadwal,
  navigate,
}) {
  const title =
    skema.judul_skema ||
    skema.nama_skema ||
    "Skema tidak tersedia";

  const kodeSkema =
    skema.kode_skema ||
    "SKEMA";

  const kegiatan =
    item.nama_kegiatan ||
    "Jadwal uji kompetensi";

  const idJadwal =
    item.id_jadwal;

  const tanggal = `${formatTanggal(
    item.tgl_awal
  )} - ${formatTanggal(
    item.tgl_akhir
  )}`;

  return (
    <article className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
      <div className="border-b border-[#071E3D]/10 px-5 py-5 md:px-6">
        <div className="flex items-center gap-4">
          <div className="flex w-11 shrink-0 items-center justify-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
              <BookOpen
                size={21}
              />
            </div>
          </div>

          <div className="w-px self-stretch shrink-0 bg-[#071E3D]/10" />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#CC6B27]">
                {kodeSkema}
              </span>

              <span className="text-[#071E3D]/20">
                •
              </span>

              {sudahDipilih ? (
                <StatusBadge
                  type="success"
                  label="Dipilih"
                />
              ) : (
                <StatusBadge
                  type="light"
                  label="Tersedia"
                />
              )}
            </div>

            <h3 className="mt-1.5 text-[18px] font-black leading-snug text-[#071E3D] md:text-[20px]">
              {title}
            </h3>

            <p className="mt-1.5 text-[12px] font-medium leading-relaxed text-[#182D4A]/70">
              {kegiatan}
            </p>
          </div>

          <div className="hidden shrink-0 sm:block">
            <span className="inline-flex items-center gap-2 rounded-lg bg-[#FAFAFA] px-3 py-2 text-[10px] font-bold text-[#182D4A]/60">
              <Tag
                size={13}
                className="text-[#CC6B27]"
              />
              ID{" "}
              {idJadwal ||
                "-"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2 xl:grid-cols-4 md:p-6">
        <DetailItem
          icon={
            <CalendarCheck
              size={18}
            />
          }
          label="Tanggal"
          value={tanggal}
        />

        <DetailItem
          icon={
            <MapPin
              size={18}
            />
          }
          label="Tempat Uji Kompetensi"
          value={
            tuk.nama_tuk ||
            tuk.nama ||
            "-"
          }
        />

        <DetailItem
          icon={
            <MonitorCheck
              size={18}
            />
          }
          label="Pelaksanaan Uji"
          value={
            item.pelaksanaan_uji ||
            "-"
          }
        />

        <DetailItem
          icon={
            <Users
              size={18}
            />
          }
          label="Kuota"
          value={`${item.kuota || 0} Peserta`}
        />
      </div>

      <div className="border-t border-[#071E3D]/10 bg-[#FAFAFA] px-5 py-4 md:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-[10px] font-bold text-[#182D4A]/60">
            <Tag
              size={13}
              className="text-[#CC6B27]"
            />
            ID Jadwal:{" "}
            {idJadwal ||
              "-"}
          </span>

          {idSkema && (
            <span className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-[10px] font-bold text-[#182D4A]/60">
              <Tag
                size={13}
                className="text-[#CC6B27]"
              />
              ID Skema:{" "}
              {idSkema}
            </span>
          )}

          {sudahDipilih && (
            <span className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-[10px] font-bold text-[#182D4A]/60">
              <Tag
                size={13}
                className="text-[#CC6B27]"
              />
              ID Peserta:{" "}
              {idPeserta ||
                "-"}
            </span>
          )}
        </div>
      </div>

      <div className="border-t border-[#071E3D]/10 bg-white px-5 py-5 md:px-6">
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#182D4A]/60">
            Aksi Jadwal
          </p>

          <p className="mt-1 text-[13px] font-bold text-[#071E3D]">
            {sudahDipilih
              ? "Jadwal ini sudah dipilih."
              : "Pilih jadwal untuk melanjutkan proses sertifikasi."}
          </p>
        </div>

        {!sudahDipilih ? (
          <button
            type="button"
            disabled={
              sedangMemilih
            }
            onClick={() =>
              pilihJadwal(
                item.id_jadwal
              )
            }
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#CC6B27] px-5 py-3 text-[12px] font-bold text-white shadow-sm transition-all hover:bg-[#071E3D] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {sedangMemilih ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                />
                Memilih Jadwal
              </>
            ) : (
              <>
                <ShieldCheck
                  size={16}
                />
                Pilih Jadwal
              </>
            )}
          </button>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <button
              type="button"
              disabled
              className="flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-5 py-3 text-[12px] font-bold text-green-600"
            >
              <CheckCircle
                size={16}
              />
              Sudah Dipilih
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/asesi/jadwal-saya"
                )
              }
              className="flex items-center justify-center gap-2 rounded-lg border border-[#071E3D]/20 bg-white px-5 py-3 text-[12px] font-bold text-[#071E3D] transition-all hover:border-[#071E3D] hover:bg-[#071E3D] hover:text-white"
            >
              Lihat Jadwal Saya
              <ChevronRight
                size={16}
              />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

function DetailItem({
  icon,
  label,
  value,
}) {
  return (
    <div className="rounded-lg border border-[#071E3D]/10 bg-[#FAFAFA] p-4">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#CC6B27]">
        {icon}
      </div>

      <p className="text-[10px] font-bold uppercase tracking-widest text-[#182D4A]/60">
        {label}
      </p>

      <p className="mt-1 line-clamp-2 text-[13px] font-bold leading-5 text-[#071E3D]">
        {value || "-"}
      </p>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone = "orange",
}) {
  const tones = {
    orange:
      "bg-[#CC6B27]/10 text-[#CC6B27]",
    green:
      "bg-green-50 text-green-600",
    red:
      "bg-red-50 text-red-500",
  };

  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#071E3D]/10 bg-white p-5 shadow-sm">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${
          tones[tone] ||
          tones.orange
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#182D4A]/60">
          {label}
        </p>

        <p className="mt-1 truncate text-[19px] font-black text-[#071E3D]">
          {value}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({
  type = "light",
  label,
}) {
  const styles = {
    success:
      "border-green-200 bg-green-50 text-green-600",
    warning:
      "border-amber-200 bg-amber-50 text-amber-600",
    danger:
      "border-red-200 bg-red-50 text-red-600",
    light:
      "border-slate-200 bg-slate-50 text-slate-500",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-wider ${
        styles[type] ||
        styles.light
      }`}
    >
      {label}
    </span>
  );
}

function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from(
    {
      length:
        totalPages,
    },
    (_, index) =>
      index + 1
  );

  const startItem =
    (currentPage - 1) *
      itemsPerPage +
    1;

  const endItem =
    Math.min(
      currentPage *
        itemsPerPage,
      totalItems
    );

  return (
    <section className="rounded-xl border border-[#071E3D]/10 bg-white px-5 py-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-[12px] font-medium text-[#182D4A]/60">
          Menampilkan{" "}
          <span className="font-bold text-[#071E3D]">
            {startItem}-
            {endItem}
          </span>{" "}
          dari{" "}
          <span className="font-bold text-[#071E3D]">
            {totalItems}
          </span>{" "}
          jadwal
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              onPageChange(
                currentPage - 1
              )
            }
            disabled={
              currentPage === 1
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#071E3D]/20 bg-white text-[#071E3D] transition-all hover:border-[#CC6B27] hover:text-[#CC6B27] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft
              size={16}
            />
          </button>

          <div className="flex items-center gap-1">
            {pages.map(
              (page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() =>
                    onPageChange(
                      page
                    )
                  }
                  className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-[11px] font-bold transition-all ${
                    currentPage ===
                    page
                      ? "bg-[#071E3D] text-white"
                      : "border border-[#071E3D]/20 bg-white text-[#071E3D] hover:border-[#CC6B27] hover:text-[#CC6B27]"
                  }`}
                >
                  {page}
                </button>
              )
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              onPageChange(
                currentPage + 1
              )
            }
            disabled={
              currentPage ===
              totalPages
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#071E3D]/20 bg-white text-[#071E3D] transition-all hover:border-[#CC6B27] hover:text-[#CC6B27] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight
              size={16}
            />
          </button>
        </div>
      </div>
    </section>
  );
}

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-5">
      <div className="w-full max-w-sm rounded-xl border border-[#071E3D]/10 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-[#071E3D]">
          <Loader2
            size={30}
            className="animate-spin text-white"
          />
        </div>

        <h2 className="text-[18px] font-black text-[#071E3D]">
          Memuat Jadwal
        </h2>

        <p className="mt-2 text-[12px] font-medium text-[#182D4A]/60">
          Sistem sedang mengambil data
          jadwal sertifikasi yang tersedia.
        </p>
      </div>
    </div>
  );
}

function ErrorAlert({
  message,
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-red-100 bg-red-50 px-5 py-4 text-[12px] font-semibold text-red-600">
      <AlertCircle
        size={18}
        className="shrink-0"
      />

      <span>{message}</span>
    </div>
  );
}

function EmptyState({
  search,
}) {
  return (
    <div className="rounded-lg border border-dashed border-[#071E3D]/15 bg-[#FAFAFA] px-6 py-14 text-center">
      {search ? (
        <XCircle
          size={42}
          className="mx-auto mb-4 text-[#CC6B27]/50"
        />
      ) : (
        <Inbox
          size={42}
          className="mx-auto mb-4 text-[#071E3D]/20"
        />
      )}

      <h3 className="text-[16px] font-bold text-[#071E3D]">
        {search
          ? "Jadwal Tidak Ditemukan"
          : "Belum Ada Jadwal"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-[12px] font-medium leading-relaxed text-[#182D4A]/60">
        {search
          ? "Coba gunakan kata kunci lain untuk mencari jadwal sertifikasi."
          : "Saat ini belum ada jadwal sertifikasi yang tersedia."}
      </p>
    </div>
  );
}