import React, { useEffect, useMemo, useRef, useState } from "react";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import axios from "axios";
import FRIA05AsesiWarning from "./FRIA05AsesiWarning";
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
  Lock,
  MapPin,
  MonitorCheck,
  RefreshCcw,
  Search,
  ShieldCheck,
  Tag,
  XCircle,
} from "lucide-react";

export default function JadwalSaya() {
  const [jadwal, setJadwal] = useState([]);
  const [myJadwal, setMyJadwal] = useState([]);
  const [pembayaran, setPembayaran] = useState({});
  const [apl01Status, setApl01Status] = useState({});
  const [apl02Status, setApl02Status] = useState({});
  const [presensiStatus, setPresensiStatus] = useState({});
  const [fria05Status, setFria05Status] = useState({});
  const [hasilAsesmenStatus, setHasilAsesmenStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [choosingId, setChoosingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("semua");
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showFRIA05Warning, setShowFRIA05Warning] = useState(false);
  const [selectedFRIA05Item, setSelectedFRIA05Item] = useState(null);

  const hasLoadedRef = useRef(false);
  const requestRunningRef = useRef(false);
  const navigate = useNavigate();

  const API =
    import.meta.env.VITE_API_BASE ||
    "http://localhost:3000/api";

  const getToken = () => localStorage.getItem("token");

  const getHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
  });

  useEffect(() => {
    if (hasLoadedRef.current) {
      return;
    }

    hasLoadedRef.current = true;
    loadData();
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

  const normalizePaymentStatus = (status) => {
    const value = String(
      status || "belum bayar"
    )
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_");

    if (value === "belum_bayar") {
      return "belum bayar";
    }

    if (
      value === "menunggu_validasi_admin" ||
      value === "menunggu_validasi"
    ) {
      return "menunggu_validasi";
    }

    if (value === "pending") {
      return "pending";
    }

    if (value === "paid") {
      return "paid";
    }

    if (value === "ditolak") {
      return "ditolak";
    }

    if (value === "expired") {
      return "expired";
    }

    if (value === "cancelled") {
      return "cancelled";
    }

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

  const getSelectedJadwal = (idJadwal) => {
    return myJadwal.find(
      (item) =>
        Number(item.id_jadwal) ===
        Number(idJadwal)
    );
  };

  const getIdPesertaByJadwal = (idJadwal) => {
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

  const isSudahDipilih = (idJadwal) => {
    return myJadwal.some(
      (item) =>
        Number(item.id_jadwal) ===
        Number(idJadwal)
    );
  };

  const getPembayaranData = (item) => {
    const idSkema = getIdSkema(item);

    return pembayaran[idSkema] || null;
  };

  const getStatusPembayaran = (item) => {
    const data = getPembayaranData(item);

    if (!data) {
      return "belum bayar";
    }

    return normalizePaymentStatus(data.status);
  };

  const getIdPeserta = (item) => {
    return (
      item.id_peserta ||
      item.raw?.id_peserta ||
      item.raw?.id_peserta_jadwal ||
      item.raw?.id ||
      item.raw?.id_pendaftaran
    );
  };

  const loadData = async (
    showMainLoading = true
  ) => {
    if (requestRunningRef.current) {
      return;
    }

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

      const [
        jadwalRes,
        sayaRes,
      ] = await Promise.all([
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
        jadwalRes.data?.data || [];

      const sayaData =
        sayaRes.data?.data || [];

      const selected = sayaData
        .map(normalizePesertaJadwal)
        .filter(
          (item) => item.id_jadwal
        );

      setJadwal(jadwalData);
      setMyJadwal(selected);

      await Promise.all([
        loadStatusPembayaran(jadwalData),
        loadStatusAPL01(selected),
        loadStatusAPL02(selected),
        loadStatusPresensi(selected),
        loadStatusFRIA05(selected),
        loadStatusHasilAsesmen(selected),
      ]);
    } catch (err) {
      console.error(
        "LOAD JADWAL ERROR:",
        err
      );

      if (err.response?.status === 429) {
        setError(
          "Terlalu banyak request ke server. Tunggu beberapa saat lalu coba Refresh Jadwal."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Gagal memuat jadwal."
        );
      }
    } finally {
      requestRunningRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadStatusPembayaran = async (
    jadwalData
  ) => {
    const result = {};

    const uniqueSkemaIds = [
      ...new Set(
        jadwalData
          .map((item) =>
            getIdSkema(item)
          )
          .filter(Boolean)
      ),
    ];

    const requests =
      uniqueSkemaIds.map(
        async (idSkema) => {
          try {
            const res =
              await axios.get(
                `${API}/asesi/pembayaran/${idSkema}/status`,
                {
                  headers:
                    getHeaders(),
                }
              );

            const data =
              res.data?.data || {};

            result[idSkema] = {
              id_pembayaran:
                data.id_pembayaran ||
                null,
              id_user:
                data.id_user ||
                null,
              id_peserta:
                data.id_peserta ||
                null,
              id_skema:
                data.id_skema ||
                idSkema,
              status:
                normalizePaymentStatus(
                  data.status
                ),
              metode_pembayaran:
                data.metode_pembayaran ||
                null,
              jalur_pembayaran:
                data.jalur_pembayaran ||
                null,
              nominal:
                data.nominal || 0,
              waktu_batas:
                data.waktu_batas ||
                null,
              waktu_pembayaran:
                data.waktu_pembayaran ||
                null,
              bukti_bayar:
                data.bukti_bayar ||
                null,
              catatan_admin:
                data.catatan_admin ||
                null,
            };
          } catch (err) {
            if (
              err.response?.status ===
              429
            ) {
              throw err;
            }

            result[idSkema] = {
              id_pembayaran: null,
              id_skema: idSkema,
              status:
                "belum bayar",
              metode_pembayaran:
                null,
              jalur_pembayaran:
                null,
              nominal: 0,
              waktu_batas:
                null,
              waktu_pembayaran:
                null,
              bukti_bayar:
                null,
              catatan_admin:
                null,
            };
          }
        }
      );

    try {
      await Promise.all(requests);
    } catch (err) {
      if (
        err.response?.status ===
        429
      ) {
        throw err;
      }
    }

    setPembayaran(result);
  };

  const loadStatusAPL01 = async (
    selectedData
  ) => {
    const result = {};

    const requests =
      selectedData.map(
        async (item) => {
          const idPeserta =
            getIdPeserta(item);

          if (!idPeserta) {
            return;
          }

          try {
            const res =
              await axios.get(
                `${API}/asesi/apl01/${idPeserta}`,
                {
                  headers:
                    getHeaders(),
                }
              );

            const apl01 =
              res.data?.data?.apl01;

            result[idPeserta] = {
              exists: !!apl01,
              submitted:
                apl01?.status ===
                "submit",
              status:
                apl01?.status ||
                "belum_ada",
              id_apl01:
                apl01?.id_apl01 ||
                null,
            };
          } catch (err) {
            if (
              err.response?.status ===
              429
            ) {
              throw err;
            }

            result[idPeserta] = {
              exists: false,
              submitted: false,
              status:
                "belum_ada",
              id_apl01: null,
            };
          }
        }
      );

    try {
      await Promise.all(requests);
    } catch (err) {
      if (
        err.response?.status ===
        429
      ) {
        throw err;
      }
    }

    setApl01Status(result);
  };

  const loadStatusAPL02 = async (
    selectedData
  ) => {
    const result = {};

    const requests =
      selectedData.map(
        async (item) => {
          const idPeserta =
            getIdPeserta(item);

          if (!idPeserta) {
            return;
          }

          try {
            const res =
              await axios.get(
                `${API}/asesi/apl02/${idPeserta}`,
                {
                  headers:
                    getHeaders(),
                }
              );

            const apl02 =
              res.data?.data;

            result[idPeserta] = {
              exists: !!apl02,
              submitted:
                apl02?.status ===
                "submitted",
              status:
                apl02?.status ||
                "belum_ada",
              id_apl02:
                apl02?.id_apl02 ||
                null,
            };
          } catch (err) {
            if (
              err.response?.status ===
              429
            ) {
              throw err;
            }

            result[idPeserta] = {
              exists: false,
              submitted: false,
              status:
                "belum_ada",
              id_apl02: null,
            };
          }
        }
      );

    try {
      await Promise.all(requests);
    } catch (err) {
      if (
        err.response?.status ===
        429
      ) {
        throw err;
      }
    }

    setApl02Status(result);
  };

  const loadStatusPresensi = async (
    selectedData
  ) => {
    const result = {};

    const requests =
      selectedData.map(
        async (item) => {
          const idPeserta =
            getIdPeserta(item);

          if (!idPeserta) {
            return;
          }

          try {
            const res =
              await axios.get(
                `${API}/asesi/presensi/status/${idPeserta}`,
                {
                  headers:
                    getHeaders(),
                }
              );

            const data =
              res.data?.data || {};

            result[idPeserta] = {
              hadir:
                data?.is_submitted ===
                true,
              status:
                data?.is_submitted
                  ? "hadir"
                  : "belum",
            };
          } catch (err) {
            if (
              err.response?.status ===
              429
            ) {
              throw err;
            }

            result[idPeserta] = {
              hadir: false,
              status: "belum",
            };
          }
        }
      );

    try {
      await Promise.all(requests);
    } catch (err) {
      if (
        err.response?.status ===
        429
      ) {
        throw err;
      }
    }

    setPresensiStatus(result);
  };

  const loadStatusFRIA05 = async (
    selectedData
  ) => {
    const result = {};

    const requests =
      selectedData.map(
        async (item) => {
          const idPeserta =
            getIdPeserta(item);

          if (!idPeserta) {
            return;
          }

          try {
            const res =
              await axios.get(
                `${API}/asesi/fr-ia05/status/${idPeserta}`,
                {
                  headers:
                    getHeaders(),
                }
              );

            const data =
              res.data?.data || {};

            result[idPeserta] = {
              submitted:
                data?.submitted ===
                true,
              status:
                data?.status ||
                "belum",
            };
          } catch (err) {
            if (
              err.response?.status ===
              429
            ) {
              throw err;
            }

            result[idPeserta] = {
              submitted: false,
              status: "belum",
            };
          }
        }
      );

    try {
      await Promise.all(requests);
    } catch (err) {
      if (
        err.response?.status ===
        429
      ) {
        throw err;
      }
    }

    setFria05Status(result);
  };

  const loadStatusHasilAsesmen =
    async (selectedData) => {
      const result = {};

      const requests =
        selectedData.map(
          async (item) => {
            const idPeserta =
              getIdPeserta(item);

            if (!idPeserta) {
              return;
            }

            try {
              const res =
                await axios.get(
                  `${API}/asesi/hasil-saya/detail?id_peserta=${idPeserta}`,
                  {
                    headers:
                      getHeaders(),
                  }
                );

              const data =
                res.data?.data || {};

              result[idPeserta] = {
                tersedia: true,
                status:
                  data.status_asesmen ||
                  data.hasil ||
                  "belum_tersedia",
              };
            } catch (err) {
              if (
                err.response
                  ?.status ===
                429
              ) {
                throw err;
              }

              result[idPeserta] = {
                tersedia: false,
                status:
                  "belum_tersedia",
              };
            }
          }
        );

      try {
        await Promise.all(requests);
      } catch (err) {
        if (
          err.response?.status ===
          429
        ) {
          throw err;
        }
      }

      setHasilAsesmenStatus(
        result
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
          { id_jadwal: idJadwal },
          {
            headers:
              getHeaders(),
          }
        );

      alert(
        "Jadwal berhasil dipilih. Silakan lanjut pembayaran."
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

      await loadData(false);
    } catch (err) {
      const message =
        err.response?.data?.message;

      if (
        message
          ?.toLowerCase()
          .includes(
            "sudah terdaftar"
          )
      ) {
        alert(
          "Anda sudah memilih jadwal ini."
        );
        await loadData(false);
      } else if (
        err.response?.status ===
        429
      ) {
        alert(
          "Terlalu banyak request. Tunggu sebentar lalu coba lagi."
        );
      } else {
        alert(
          message ||
            "Gagal memilih jadwal."
        );
      }
    } finally {
      setChoosingId(null);
    }
  };

  const pergiBayar = (item) => {
    const idSkema =
      getIdSkema(item);

    const statusBayar =
      getStatusPembayaran(item);

    if (!idSkema) {
      alert(
        "ID skema tidak ditemukan."
      );
      return;
    }

    if (
      statusBayar === "pending" ||
      statusBayar ===
        "menunggu_validasi"
    ) {
      alert(
        "Pembayaran sedang menunggu validasi admin. Tidak bisa bayar ulang."
      );
      return;
    }

    if (statusBayar === "paid") {
      alert(
        "Pembayaran sudah diterima admin."
      );
      return;
    }

    navigate(
      `/asesi/pembayaran/${idSkema}`
    );
  };

  const pergiAPL01 = (item) => {
    const idPeserta =
      getIdPesertaByJadwal(
        item.id_jadwal
      );

    if (!idPeserta) {
      alert(
        "ID peserta tidak ditemukan. Silakan klik Refresh lalu coba lagi."
      );
      return;
    }

    navigate(
      `/asesi/apl01/${idPeserta}`
    );
  };

  const pergiAPL02 = (item) => {
    const idSkema =
      getIdSkema(item);

    const idPeserta =
      getIdPesertaByJadwal(
        item.id_jadwal
      );

    if (!idSkema) {
      alert(
        "ID skema tidak ditemukan."
      );
      return;
    }

    navigate(
      `/asesi/apl02/${idSkema}`,
      {
        state: {
          id_peserta:
            idPeserta,
        },
      }
    );
  };

  const pergiPresensi = () => {
    navigate(
      "/asesi/pra-asesmen"
    );
  };

  const pergiFRIA05 = (item) => {
    setSelectedFRIA05Item(item);
    setShowFRIA05Warning(true);
  };

  const mulaiFRIA05 = () => {
    if (!selectedFRIA05Item) {
      return;
    }

    const idPeserta =
      getIdPesertaByJadwal(
        selectedFRIA05Item.id_jadwal
      );

    const idJadwal =
      selectedFRIA05Item.id_jadwal ||
      selectedFRIA05Item.jadwal
        ?.id_jadwal ||
      selectedFRIA05Item.Jadwal
        ?.id_jadwal;

    if (!idJadwal) {
      alert(
        "ID jadwal tidak ditemukan."
      );
      return;
    }

    if (!idPeserta) {
      alert(
        "ID peserta tidak ditemukan."
      );
      return;
    }

    setShowFRIA05Warning(false);

    navigate(
      `/asesi/fr-ia05/jadwal/${idJadwal}/${idPeserta}`
    );
  };

  const pergiHasilAkhir = (item) => {
    const idPeserta =
      getIdPesertaByJadwal(
        item.id_jadwal
      );

    if (!idPeserta) {
      alert(
        "ID peserta tidak ditemukan. Silakan klik Refresh lalu coba lagi."
      );
      return;
    }

    navigate(
      `/asesi/hasil-akhir/${idPeserta}`
    );
  };

  const handleRefresh = async () => {
    await loadData(false);
  };

  const formatTanggal = (date) => {
    if (!date) {
      return "-";
    }

    const parsed = new Date(date);

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

  const filteredJadwal = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    return jadwal.filter((item) => {
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

      const statusBayar =
        getStatusPembayaran(item);

      const searchableText = [
        skema.judul_skema,
        skema.kode_skema,
        tuk.nama_tuk,
        item.nama_kegiatan,
        item.pelaksanaan_uji,
        item.status,
        item.lokasi,
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
        (filter === "dipilih" &&
          sudahDipilih) ||
        (filter === "belum" &&
          !sudahDipilih) ||
        (filter === "validasi" &&
          (statusBayar ===
            "pending" ||
            statusBayar ===
              "menunggu_validasi")) ||
        (filter === "paid" &&
          statusBayar ===
            "paid") ||
        (filter === "ditolak" &&
          statusBayar ===
            "ditolak");

      return (
        matchSearch &&
        matchFilter
      );
    });
  }, [
    jadwal,
    myJadwal,
    pembayaran,
    search,
    filter,
  ]);

  const totalDipilih =
    myJadwal.length;

  const totalPaid =
    jadwal.filter(
      (item) =>
        getStatusPembayaran(
          item
        ) === "paid"
    ).length;

  const totalMenunggu =
    jadwal.filter(
      (item) => {
        const status =
          getStatusPembayaran(
            item
          );

        return (
          status === "pending" ||
          status ===
            "menunggu_validasi"
        );
      }
    ).length;

  const totalTersedia =
    jadwal.length;

  if (loading) {
    return <LoadingState />;
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
                    Jadwal{" "}
                    <span className="text-[#CC6B27]">
                      Saya
                    </span>
                  </h1>

                  <p className="mt-1 max-w-3xl text-[13px] font-medium leading-5 text-[#182D4A]/70">
                    Pantau jadwal sertifikasi,
                    status pembayaran, dan tahapan
                    asesmen yang harus Anda selesaikan.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      navigate("/asesi")
                    }
                    className="rounded-lg border border-[#071E3D]/20 bg-white px-4 py-2.5 text-[12px] font-bold text-[#071E3D] shadow-sm transition-all hover:border-[#071E3D] hover:bg-[#071E3D] hover:text-white"
                  >
                    Dashboard
                  </button>

                  <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={refreshing}
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
                  <CheckCircle
                    size={22}
                  />
                }
                label="Menunggu Validasi"
                value={`${totalMenunggu} Pembayaran`}
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
                    {filteredJadwal.length} jadwal ditemukan
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
                      value={search}
                      onChange={(e) =>
                        setSearch(
                          e.target.value
                        )
                      }
                      placeholder="Cari Jadwal, Skema, TUK..."
                      className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] py-2.5 pl-10 pr-4 text-[13px] font-medium text-[#071E3D] outline-none transition-all placeholder:text-[#182D4A]/40 focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
                    />
                  </div>

                  <select
                    value={filter}
                    onChange={(e) =>
                      setFilter(
                        e.target.value
                      )
                    }
                    className="rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-4 py-2.5 text-[13px] font-bold text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:bg-white"
                  >
                    <option value="semua">
                      Semua Status
                    </option>
                    <option value="dipilih">
                      Dipilih
                    </option>
                    <option value="belum">
                      Belum Bayar
                    </option>
                    <option value="validasi">
                      Menunggu Validasi
                    </option>
                    <option value="paid">
                      Paid
                    </option>
                    <option value="ditolak">
                      Ditolak
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-5 md:p-6">
              {loading ? (
                <LoadingState />
              ) : filteredJadwal.length ===
                0 ? (
                <EmptyState
                  search={search}
                />
              ) : (
                <div className="space-y-3">
                  {filteredJadwal.map(
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

                      const pembayaranData =
                        getPembayaranData(
                          item
                        );

                      const statusPembayaran =
                        getStatusPembayaran(
                          item
                        );

                      const sudahPaid =
                        statusPembayaran ===
                        "paid";

                      const menungguValidasi =
                        statusPembayaran ===
                          "pending" ||
                        statusPembayaran ===
                          "menunggu_validasi";

                      const pembayaranDitolak =
                        statusPembayaran ===
                        "ditolak";

                      return (
                        <ScheduleCard
                          key={
                            item.id_jadwal ||
                            index
                          }
                          item={item}
                          skema={
                            skema
                          }
                          tuk={tuk}
                          idPeserta={
                            idPeserta
                          }
                          sudahDipilih={
                            sudahDipilih
                          }
                          sedangMemilih={
                            sedangMemilih
                          }
                          pembayaranData={
                            pembayaranData
                          }
                          statusPembayaran={
                            statusPembayaran
                          }
                          sudahPaid={
                            sudahPaid
                          }
                          menungguValidasi={
                            menungguValidasi
                          }
                          pembayaranDitolak={
                            pembayaranDitolak
                          }
                          apl01Data={
                            apl01Status[
                              idPeserta
                            ] || {}
                          }
                          apl02Data={
                            apl02Status[
                              idPeserta
                            ] || {}
                          }
                          presensiData={
                            presensiStatus[
                              idPeserta
                            ] || {}
                          }
                          fria05Data={
                            fria05Status[
                              idPeserta
                            ] || {}
                          }
                          hasilAsesmenData={
                            hasilAsesmenStatus[
                              idPeserta
                            ] || {}
                          }
                          formatTanggal={
                            formatTanggal
                          }
                          pilihJadwal={
                            pilihJadwal
                          }
                          pergiBayar={
                            pergiBayar
                          }
                          pergiAPL01={
                            pergiAPL01
                          }
                          pergiAPL02={
                            pergiAPL02
                          }
                          pergiPresensi={
                            pergiPresensi
                          }
                          pergiFRIA05={
                            pergiFRIA05
                          }
                          pergiHasilAkhir={
                            pergiHasilAkhir
                          }
                        />
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        <FRIA05AsesiWarning
          open={
            showFRIA05Warning
          }
          duration={120}
          onClose={() => {
            setShowFRIA05Warning(
              false
            );
            setSelectedFRIA05Item(
              null
            );
          }}
          onConfirm={
            mulaiFRIA05
          }
        />
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
  statusPembayaran,
  sudahPaid,
  menungguValidasi,
  pembayaranDitolak,
  apl01Data,
  apl02Data,
  presensiData,
  fria05Data,
  hasilAsesmenData,
  formatTanggal,
  pilihJadwal,
  pergiBayar,
  pergiAPL01,
  pergiAPL02,
  pergiPresensi,
  pergiFRIA05,
  pergiHasilAkhir,
}) {
  const title =
    skema.judul_skema ||
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

  const isApl01Done =
    apl01Data?.submitted === true;

  const isApl02Done =
    apl02Data?.submitted === true;

  const isPresensiDone =
    presensiData?.hadir === true;

  const tglAwal =
    item.tgl_awal ||
    item.jadwal?.tgl_awal;

  const tglAkhir =
    item.tgl_akhir ||
    item.jadwal?.tgl_akhir;

  const mulai =
    tglAwal
      ? new Date(tglAwal)
      : null;

  const selesai =
    tglAkhir
      ? new Date(tglAkhir)
      : null;

  if (selesai) {
    selesai.setHours(
      23,
      59,
      59,
      999
    );
  }

  const hariIni =
    new Date();

  const isHariH =
    mulai &&
    selesai &&
    hariIni >= mulai &&
    hariIni <= selesai;

  const unlockApl02 =
    sudahPaid &&
    isApl01Done;

  const unlockPresensi =
    sudahPaid &&
    isApl01Done &&
    isApl02Done &&
    isHariH;

  const unlockFRIA05 =
    sudahPaid &&
    isApl01Done &&
    isApl02Done &&
    isPresensiDone &&
    isHariH;

  const fria05Submitted =
    fria05Data?.submitted ===
    true;

  const hasilSudahTerbit =
    [
      "kompeten",
      "belum_kompeten",
    ].includes(
      String(
        hasilAsesmenData?.status ||
          ""
      ).toLowerCase()
    );

  const unlockHasilAkhir =
    sudahPaid &&
    hasilSudahTerbit;

  const statusInfo =
    getPaymentLabel(
      statusPembayaran
    );

  return (
    <article className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
      <div className="border-b border-[#071E3D]/10 px-5 py-5 md:px-6">
        <div className="flex items-center gap-4">
          <div className="flex w-11 shrink-0 items-center justify-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
              <BookOpen size={21} />
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

              <span className="text-[#071E3D]/20">
                •
              </span>

              <StatusBadge
                type={
                  statusPembayaran ===
                  "paid"
                    ? "success"
                    : statusPembayaran ===
                        "ditolak"
                      ? "danger"
                      : statusPembayaran ===
                            "pending" ||
                          statusPembayaran ===
                            "menunggu_validasi"
                        ? "warning"
                        : "light"
                }
                label={statusInfo}
              />
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
              ID {idJadwal || "-"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2 xl:grid-cols-4 md:p-6">
        <DetailItem
          icon={
            <CalendarCheck size={18} />
          }
          label="Tanggal"
          value={tanggal}
        />

        <DetailItem
          icon={
            <MapPin size={18} />
          }
          label="Tempat Uji Kompetensi"
          value={
            tuk.nama_tuk ||
            "-"
          }
        />

        <DetailItem
          icon={
            <MonitorCheck size={18} />
          }
          label="Pelaksanaan Uji"
          value={
            item.pelaksanaan_uji ||
            "-"
          }
        />

        <DetailItem
          icon={
            <CreditCard size={18} />
          }
          label="Pembayaran"
          value={
            statusInfo
          }
        />
      </div>

      <div className="border-t border-[#071E3D]/10 bg-[#FAFAFA] px-5 py-4 md:px-6">
        <div className="flex flex-wrap items-center gap-2">
          {sudahDipilih && (
            <span className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-[10px] font-bold text-[#182D4A]/60">
              <Tag size={13} />
              ID Peserta:{" "}
              {idPeserta || "-"}
            </span>
          )}

          {pembayaranData?.id_pembayaran && (
            <span className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-[10px] font-bold text-[#182D4A]/60">
              <Tag size={13} />
              ID Pembayaran:{" "}
              {
                pembayaranData.id_pembayaran
              }
            </span>
          )}

          {isApl01Done && (
            <StatusBadge
              type="success"
              label="APL01 Selesai"
            />
          )}

          {isApl02Done && (
            <StatusBadge
              type="success"
              label="APL02 Selesai"
            />
          )}

          {isPresensiDone && (
            <StatusBadge
              type="success"
              label="Presensi Selesai"
            />
          )}
        </div>
      </div>

      <div className="border-t border-[#071E3D]/10 bg-white px-5 py-5 md:px-6">
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#182D4A]/60">
            Tahapan Asesmen
          </p>

          <p className="mt-1 text-[13px] font-bold text-[#071E3D]">
            Lanjutkan proses sesuai
            tahapan yang tersedia.
          </p>
        </div>

        {!sudahDipilih ? (
          <button
            type="button"
            disabled={sedangMemilih}
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
        ) : menungguValidasi ? (
          <button
            type="button"
            disabled
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-5 py-3 text-[12px] font-bold text-amber-700"
          >
            <Loader2
              size={16}
              className="animate-spin"
            />
            Menunggu Validasi Admin
          </button>
        ) : pembayaranDitolak ? (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px]">
            <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-[11px] font-semibold leading-relaxed text-red-700">
              Pembayaran ditolak admin.
              {pembayaranData?.catatan_admin
                ? ` Catatan: ${pembayaranData.catatan_admin}`
                : " Silakan lakukan pembayaran ulang."}
            </div>

            <button
              type="button"
              onClick={() =>
                pergiBayar(item)
              }
              className="flex items-center justify-center gap-2 rounded-lg bg-[#CC6B27] px-5 py-3 text-[12px] font-bold text-white transition-all hover:bg-[#071E3D]"
            >
              <CreditCard size={16} />
              Bayar Ulang
            </button>
          </div>
        ) : sudahPaid ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
            <ActionButton
              title={
                isApl01Done
                  ? "Lihat APL01"
                  : "Isi APL01"
              }
              onClick={() =>
                pergiAPL01(item)
              }
            />

            {unlockApl02 ? (
              <ActionButton
                title="Isi / Lihat APL02"
                onClick={() =>
                  pergiAPL02(item)
                }
              />
            ) : (
              <LockedMessage text="APL02 tersedia setelah APL01 selesai disubmit." />
            )}

            {unlockPresensi ? (
              <ActionButton
                title="Presensi Ujian"
                onClick={() =>
                  pergiPresensi(item)
                }
              />
            ) : (
              <LockedMessage text="Presensi terbuka setelah APL01 dan APL02 selesai serta jadwal sudah dimulai." />
            )}

            {unlockFRIA05 ? (
              fria05Submitted ? (
                <LockedMessage text="FR.IA.05 telah disubmit. Menunggu penilaian asesor." />
              ) : (
                <ActionButton
                  title="Mulai FR.IA.05"
                  onClick={() =>
                    pergiFRIA05(item)
                  }
                />
              )
            ) : (
              <LockedMessage text="FR.IA.05 terbuka setelah presensi selesai." />
            )}

            {unlockHasilAkhir ? (
              <ActionButton
                title="Lihat Hasil Akhir"
                onClick={() =>
                  pergiHasilAkhir(item)
                }
              />
            ) : (
              <LockedMessage text="Hasil akhir tersedia setelah penilaian asesor selesai." />
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() =>
              pergiBayar(item)
            }
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#CC6B27] px-5 py-3 text-[12px] font-bold text-white shadow-sm transition-all hover:bg-[#071E3D]"
          >
            <CreditCard size={16} />
            Bayar Sekarang
          </button>
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

function ActionButton({
  title,
  onClick,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-4 py-3 text-[11px] font-bold transition-all ${
        disabled
          ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400"
          : "border border-[#CC6B27] bg-[#CC6B27] text-white shadow-sm hover:border-[#A8561F] hover:bg-[#A8561F]"
      }`}
    >
      <FileText size={15} />
      {title}
    </button>
  );
}

function LockedMessage({
  text,
}) {
  return (
    <div className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-center text-[10px] font-semibold leading-relaxed text-slate-500">
      <Lock
        size={13}
        className="shrink-0 text-slate-400"
      />
      {text}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="rounded-lg border border-dashed border-[#071E3D]/15 bg-[#FAFAFA] p-12 text-center">
      <Loader2
        size={32}
        className="mx-auto mb-3 animate-spin text-[#CC6B27]"
      />

      <h3 className="text-[16px] font-bold text-[#071E3D]">
        Memuat Jadwal
      </h3>

      <p className="mt-1 text-[12px] font-medium text-[#182D4A]/60">
        Sistem sedang mengambil data jadwal sertifikasi Anda.
      </p>
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

function getPaymentLabel(
  status
) {
  const labels = {
    "belum bayar":
      "Belum Bayar",
    pending: "Pending",
    menunggu_validasi:
      "Menunggu Validasi",
    paid: "Paid",
    ditolak: "Ditolak",
    expired: "Expired",
    cancelled:
      "Dibatalkan",
  };

  return (
    labels[status] ||
    status ||
    "Belum Bayar"
  );
}