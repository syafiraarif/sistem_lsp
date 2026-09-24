// frontend/src/pages/tuk/ListJadwal.jsx

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  AlertCircle,
  CalendarCheck,
  CalendarDays,
  CheckCircle,
  ChevronRight,
  ClipboardList,
  Clock,
  FileCheck,
  Filter,
  Inbox,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Tag,
  Trash2,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import SidebarTUK from "../../components/sidebar/SidebarTuk";
import { notifikasi } from "../../components/ui/notifikasi";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "http://localhost:3000/api";

const API =
  `${API_BASE}/tuk/jadwal`;

const emptySummary = {
  asesor_penguji: {
    count: 0,
    names: [],
  },
  verifikator_tuk: {
    count: 0,
    names: [],
  },
  validator_mkva: {
    count: 0,
    names: [],
  },
  komite_teknis: {
    count: 0,
    names: [],
  },
};

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        "token"
      );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  }
);

const ListJadwal = () => {
  const navigate =
    useNavigate();

  const [jadwal, setJadwal] =
    useState([]);

  const [jenisTuk, setJenisTuk] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [filterStatus, setFilterStatus] =
    useState("semua");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [showModal, setShowModal] =
    useState(false);

  const [deleteId, setDeleteId] =
    useState(null);

  const [deleting, setDeleting] =
    useState(false);

  const isMandiri =
    jenisTuk === "mandiri";

  const getAsesorName =
    useCallback(
      (item) => {
        return (
          item?.nama_lengkap ||
          item?.profileAsesor
            ?.nama_lengkap ||
          item?.profile_asesor
            ?.nama_lengkap ||
          item?.asesor
            ?.nama_lengkap ||
          item?.asesor
            ?.username ||
          item?.user
            ?.nama_lengkap ||
          item?.user
            ?.username ||
          item?.username ||
          "-"
        );
      },
      []
    );

  const fetchProfileTuk =
    useCallback(
      async () => {
        try {
          const res =
            await api.get(
              "/tuk/profile"
            );

          const jenis =
            res.data?.data
              ?.tuk
              ?.jenis_tuk ||
            "";

          if (jenis) {
            setJenisTuk(
              jenis
            );
          } else if (
            res.data?.jenis_tuk
          ) {
            setJenisTuk(
              res.data.jenis_tuk
            );
          }
        } catch (err) {
          console.error(
            "Gagal mengambil profil TUK:",
            err
          );
        }
      },
      []
    );

  const fetchAsesorByJenis =
    useCallback(
      async (
        idJadwal,
        jenisTugas
      ) => {
        try {
          const res =
            await api.get(
              `${API}/${idJadwal}/asesor/${jenisTugas}`
            );

          const data =
            Array.isArray(
              res.data?.data
            )
              ? res.data
                  .data
              : [];

          return {
            count:
              data.length,
            names: data
              .map(
                (
                  item
                ) =>
                  getAsesorName(
                    item
                  )
              )
              .filter(Boolean)
              .slice(
                0,
                2
              ),
          };
        } catch (err) {
          console.warn(
            `Gagal fetch ${jenisTugas} jadwal ${idJadwal}:`,
            err
          );

          return {
            count: 0,
            names: [],
          };
        }
      },
      [getAsesorName]
    );

  const fetchJadwal =
    useCallback(
      async (
        showLoading = true
      ) => {
        try {
          if (showLoading) {
            setLoading(
              true
            );
          } else {
            setRefreshing(
              true
            );
          }

          const token =
            localStorage.getItem(
              "token"
            );

          if (!token) {
            await notifikasi.peringatan(
              "Sesi Berakhir",
              "Silakan login kembali untuk melanjutkan."
            );

            localStorage.clear();
            navigate(
              "/login",
              {
                replace: true,
              }
            );

            return;
          }

          const res =
            await api.get(
              "/tuk/jadwal"
            );

          const jadwalList =
            Array.isArray(
              res.data?.data
            )
              ? res.data
                  .data
              : [];

          if (
            !jenisTuk &&
            res.data?.jenis_tuk
          ) {
            setJenisTuk(
              res.data.jenis_tuk
            );
          }

          const jadwalWithAsesor =
            await Promise.all(
              jadwalList.map(
                async (
                  item
                ) => {
                  if (
                    item.status ===
                      "draft" ||
                    item.status ===
                      "ditolak" ||
                    jenisTuk !==
                      "mandiri"
                  ) {
                    return {
                      ...item,
                      asesorSummary:
                        emptySummary,
                    };
                  }

                  const [
                    penguji,
                    verifTuk,
                    mkva,
                    komiteTeknis,
                  ] =
                    await Promise.all([
                      fetchAsesorByJenis(
                        item.id_jadwal,
                        "asesor_penguji"
                      ),
                      fetchAsesorByJenis(
                        item.id_jadwal,
                        "verifikator_tuk"
                      ),
                      fetchAsesorByJenis(
                        item.id_jadwal,
                        "validator_mkva"
                      ),
                      fetchAsesorByJenis(
                        item.id_jadwal,
                        "komite_teknis"
                      ),
                    ]);

                  return {
                    ...item,
                    asesorSummary: {
                      asesor_penguji:
                        penguji,
                      verifikator_tuk:
                        verifTuk,
                      validator_mkva:
                        mkva,
                      komite_teknis:
                        komiteTeknis,
                    },
                  };
                }
              )
            );

          setJadwal(
            jadwalWithAsesor
          );
        } catch (err) {
          console.error(
            "Gagal mengambil jadwal:",
            err
          );

          const status =
            err?.response?.status;

          if (
            status === 401
          ) {
            await notifikasi.peringatan(
              "Sesi Berakhir",
              "Sesi login Anda telah berakhir. Silakan login kembali."
            );

            localStorage.clear();

            navigate(
              "/login",
              {
                replace: true,
              }
            );

            return;
          }

          await notifikasi.gagal(
            "Gagal Memuat Jadwal",
            err?.response
              ?.data
              ?.message ||
              "Gagal mengambil data jadwal."
          );

          setJadwal([]);
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [
        fetchAsesorByJenis,
        jenisTuk,
        navigate,
      ]
    );

  useEffect(() => {
    const token =
      localStorage.getItem(
        "token"
      );

    if (!token) {
      navigate(
        "/login",
        {
          replace: true,
        }
      );

      return;
    }

    fetchProfileTuk();
  }, [
    navigate,
    fetchProfileTuk,
  ]);

  useEffect(() => {
    const token =
      localStorage.getItem(
        "token"
      );

    if (!token) {
      return;
    }

    fetchJadwal();
  }, [
    fetchJadwal,
  ]);

  const handleRefresh =
    async () => {
      if (
        loading ||
        refreshing
      ) {
        return;
      }

      await fetchJadwal(
        false
      );

      await notifikasi.sukses(
        "Data Diperbarui",
        "Daftar jadwal berhasil disegarkan."
      );
    };

  const handleDeleteClick =
    (id) => {
      setDeleteId(
        id
      );

      setShowModal(
        true
      );
    };

  const handleDelete =
    async () => {
      if (!deleteId) {
        return;
      }

      try {
        setDeleting(
          true
        );

        await api.delete(
          `${API}/${deleteId}`
        );

        setShowModal(
          false
        );

        setDeleteId(
          null
        );

        await notifikasi.sukses(
          "Berhasil",
          "Jadwal berhasil dihapus."
        );

        await fetchJadwal(
          false
        );
      } catch (err) {
        console.error(
          "Delete jadwal error:",
          err
        );

        await notifikasi.gagal(
          "Gagal Menghapus",
          err?.response
            ?.data
            ?.message ||
            "Gagal menghapus jadwal."
        );
      } finally {
        setDeleting(
          false
        );
      }
    };

  const formatDate =
    (date) => {
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
            item?.skema ||
            item?.Skema ||
            {};

          const searchableText =
            [
              item?.nama_kegiatan,
              item?.kode_jadwal,
              skema?.judul_skema,
              skema?.kode_skema,
              item?.pelaksanaan_uji,
              item?.status,
              item?.lokasi,
              item?.tuk
                ?.nama_tuk,
              item?.nama_tuk,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

          const matchSearch =
            !keyword ||
            searchableText.includes(
              keyword
            );

          const matchStatus =
            filterStatus ===
              "semua" ||
            item.status ===
              filterStatus;

          return (
            matchSearch &&
            matchStatus
          );
        }
      );
    }, [
      jadwal,
      search,
      filterStatus,
    ]);

  const totalAktif =
    jadwal.filter(
      (item) =>
        [
          "disetujui",
          "open",
          "ongoing",
        ].includes(
          item.status
        )
    ).length;

  const totalDraft =
    jadwal.filter(
      (item) =>
        item.status ===
        "draft"
    ).length;

  const getStatusBadge =
    (status) => {
      const label = {
        draft: "Draft",
        disetujui:
          "Disetujui",
        ditolak:
          "Ditolak",
        open: "Open",
        ongoing:
          "Ongoing",
        selesai:
          "Selesai",
        arsip: "Arsip",
      };

      const statusClass = {
        draft:
          "border-orange-100 bg-orange-50 text-orange-600",
        ditolak:
          "border-red-100 bg-red-50 text-red-600",
        disetujui:
          "border-green-100 bg-green-50 text-green-600",
        open:
          "border-green-100 bg-green-50 text-green-600",
        ongoing:
          "border-blue-100 bg-blue-50 text-blue-600",
        selesai:
          "border-slate-200 bg-slate-50 text-slate-600",
        arsip:
          "border-slate-100 bg-slate-50 text-slate-500",
      };

      return (
        <span
          className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider ${
            statusClass[
              status
            ] ||
            statusClass.arsip
          }`}
        >
          {label[status] ||
            "Arsip"}
        </span>
      );
    };

  const getTotalAsesor =
    (summary = {}) => {
      return Object.values(
        summary
      ).reduce(
        (
          total,
          data
        ) =>
          total +
          Number(
            data?.count ||
              0
          ),
        0
      );
    };

  const handleLogout =
    () => {
      localStorage.clear();

      navigate(
        "/login",
        {
          replace: true,
        }
      );
    };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#FAFAFA]">
        <SidebarTUK
          isOpen={
            sidebarOpen
          }
          setIsOpen={
            setSidebarOpen
          }
          onLogout={
            handleLogout
          }
          handleLogout={
            handleLogout
          }
        />

        <main className="flex flex-1 items-center justify-center p-6 md:p-8">
          <LoadingState />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <SidebarTUK
        isOpen={
          sidebarOpen
        }
        setIsOpen={
          setSidebarOpen
        }
        onLogout={
          handleLogout
        }
        handleLogout={
          handleLogout
        }
      />

      <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-[1500px] space-y-5">
          <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
            <div className="border-b border-[#071E3D]/10 px-5 py-5 md:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="mb-3 h-1 w-10 rounded-full bg-[#CC6B27]" />

                  <h1 className="text-[24px] font-black text-[#071E3D] md:text-[28px]">
                    Daftar{" "}
                    <span className="text-[#CC6B27]">
                      Jadwal
                    </span>
                  </h1>

                  <p className="mt-1 max-w-3xl text-[13px] font-medium leading-5 text-[#182D4A]/70">
                    {isMandiri
                      ? "Kelola jadwal asesmen, asesor penguji, verifikator TUK, validator MKVA, dan komite teknis."
                      : "Pantau jadwal uji kompetensi yang telah dibuat dan dikelola oleh admin."}
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  {isMandiri && (
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          "/tuk/jadwal/buat"
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#CC6B27] px-4 py-2.5 text-[12px] font-bold text-white shadow-sm transition-all hover:bg-[#A8561F]"
                    >
                      <Plus
                        size={15}
                      />
                      Buat Jadwal
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={
                      handleRefresh
                    }
                    disabled={
                      refreshing
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#071E3D]/20 bg-white px-4 py-2.5 text-[12px] font-bold text-[#071E3D] shadow-sm transition-all hover:border-[#071E3D] hover:bg-[#071E3D] hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    {refreshing ? (
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />
                    ) : (
                      <CalendarCheck
                        size={15}
                      />
                    )}
                    Refresh
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
                value={`${jadwal.length} Jadwal`}
                tone="orange"
              />

              <StatCard
                icon={
                  <CheckCircle
                    size={22}
                  />
                }
                label="Jadwal Aktif"
                value={`${totalAktif} Jadwal`}
                tone="green"
              />

              <StatCard
                icon={
                  <ClipboardList
                    size={22}
                  />
                }
                label="Draft"
                value={`${totalDraft} Jadwal`}
                tone="orange"
              />
            </div>
          </section>

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
                    Cari berdasarkan kegiatan,
                    kode, skema, atau status
                    jadwal.
                  </p>

                  <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-[#182D4A]/40">
                    {
                      filteredJadwal.length
                    }{" "}
                    jadwal ditemukan
                  </p>
                </div>

                <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                  <div className="group relative w-full sm:w-[330px]">
                    <Search
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 transition-colors group-focus-within:text-[#CC6B27]"
                    />

                    <input
                      type="text"
                      value={
                        search
                      }
                      onChange={(
                        e
                      ) =>
                        setSearch(
                          e.target
                            .value
                        )
                      }
                      placeholder="Cari jadwal, skema, kode..."
                      className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] py-2.5 pl-10 pr-4 text-[13px] font-medium text-[#071E3D] outline-none transition-all placeholder:text-[#182D4A]/40 focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
                    />
                  </div>

                  <div className="relative">
                    <Filter
                      size={15}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/45"
                    />

                    <select
                      value={
                        filterStatus
                      }
                      onChange={(
                        e
                      ) =>
                        setFilterStatus(
                          e.target
                            .value
                        )
                      }
                      className="w-full appearance-none rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] py-2.5 pl-9 pr-9 text-[13px] font-bold text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:bg-white sm:w-[180px]"
                    >
                      <option value="semua">
                        Semua Status
                      </option>

                      <option value="draft">
                        Draft
                      </option>

                      <option value="disetujui">
                        Disetujui
                      </option>

                      <option value="open">
                        Open
                      </option>

                      <option value="ongoing">
                        Ongoing
                      </option>

                      <option value="selesai">
                        Selesai
                      </option>

                      <option value="ditolak">
                        Ditolak
                      </option>

                      <option value="arsip">
                        Arsip
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 md:p-6">
              {filteredJadwal.length ===
              0 ? (
                <EmptyState
                  search={
                    search
                  }
                />
              ) : (
                <div className="space-y-3">
                  {filteredJadwal.map(
                    (
                      item,
                      index
                    ) => (
                      <ScheduleCard
                        key={
                          item.id_jadwal ||
                          index
                        }
                        item={
                          item
                        }
                        isMandiri={
                          isMandiri
                        }
                        getStatusBadge={
                          getStatusBadge
                        }
                        getTotalAsesor={
                          getTotalAsesor
                        }
                        formatDate={
                          formatDate
                        }
                        onEdit={() =>
                          navigate(
                            `/tuk/jadwal/${item.id_jadwal}/edit`
                          )
                        }
                        onDelete={() =>
                          handleDeleteClick(
                            item.id_jadwal
                          )
                        }
                        onPenguji={() =>
                          navigate(
                            `/tuk/jadwal/${item.id_jadwal}/asesor`
                          )
                        }
                        onVerifikasi={() =>
                          navigate(
                            `/tuk/jadwal/${item.id_jadwal}/verifikasi`
                          )
                        }
                        onValidator={() =>
                          navigate(
                            `/tuk/jadwal/${item.id_jadwal}/validator`
                          )
                        }
                        onKomite={() =>
                          navigate(
                            `/tuk/jadwal/${item.id_jadwal}/komite-teknis`
                          )
                        }
                      />
                    )
                  )}
                </div>
              )}
            </div>
          </section>

          <div className="text-right text-[11px] font-bold text-[#182D4A]/45">
            Menampilkan{" "}
            <span className="text-[#071E3D]">
              {
                filteredJadwal.length
              }
            </span>{" "}
            dari{" "}
            <span className="text-[#071E3D]">
              {jadwal.length}
            </span>{" "}
            jadwal
          </div>
        </div>
      </main>

      {showModal && (
        <DeleteModal
          deleting={
            deleting
          }
          onCancel={() => {
            if (
              deleting
            ) {
              return;
            }

            setShowModal(
              false
            );

            setDeleteId(
              null
            );
          }}
          onConfirm={
            handleDelete
          }
        />
      )}
    </div>
  );
};

function ScheduleCard({
  item,
  isMandiri,
  getStatusBadge,
  getTotalAsesor,
  formatDate,
  onEdit,
  onDelete,
  onPenguji,
  onVerifikasi,
  onValidator,
  onKomite,
}) {
  const skema =
    item?.skema ||
    item?.Skema ||
    {};

  const tuk =
    item?.tuk ||
    item?.Tuk ||
    {};

  const summary =
    item?.asesorSummary ||
    emptySummary;

  const totalAsesor =
    getTotalAsesor(
      summary
    );

  const isDraft =
    item.status ===
    "draft";

  const isDitolak =
    item.status ===
    "ditolak";

  const canManage =
    isMandiri &&
    !isDraft &&
    !isDitolak;

  const totalTeam =
    Number(
      summary
        ?.asesor_penguji
        ?.count ||
        0
    ) +
    Number(
      summary
        ?.verifikator_tuk
        ?.count ||
        0
    ) +
    Number(
      summary
        ?.validator_mkva
        ?.count ||
        0
    ) +
    Number(
      summary
        ?.komite_teknis
        ?.count ||
        0
    );

  return (
    <article className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm transition-all hover:shadow-md">
      <div className="border-b border-[#071E3D]/10 px-5 py-5 md:px-6">
        <div className="flex items-center gap-4">
          <div className="flex w-11 shrink-0 items-center justify-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
              <ClipboardList
                size={21}
              />
            </div>
          </div>

          <div className="w-px shrink-0 self-stretch bg-[#071E3D]/10" />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {item.kode_jadwal && (
                <>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#CC6B27]">
                    {
                      item.kode_jadwal
                    }
                  </span>

                  <span className="text-[#071E3D]/20">
                    •
                  </span>
                </>
              )}

              {getStatusBadge(
                item.status
              )}

              {!isMandiri && (
                <>
                  <span className="text-[#071E3D]/20">
                    •
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                    <ShieldCheck
                      size={12}
                    />
                    Lihat Saja
                  </span>
                </>
              )}
            </div>

            <h3 className="mt-1.5 text-[18px] font-black leading-snug text-[#071E3D] md:text-[20px]">
              {skema?.judul_skema ||
                item?.nama_kegiatan ||
                "Jadwal Uji Kompetensi"}
            </h3>

            <p className="mt-1.5 text-[12px] font-medium leading-relaxed text-[#182D4A]/70">
              {item?.nama_kegiatan ||
                "Jadwal uji kompetensi"}
            </p>
          </div>

          <div className="hidden shrink-0 sm:block">
            <span className="inline-flex items-center gap-2 rounded-lg bg-[#FAFAFA] px-3 py-2 text-[10px] font-bold text-[#182D4A]/60">
              <Tag
                size={13}
                className="text-[#CC6B27]"
              />
              ID{" "}
              {item?.id_jadwal ||
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
          value={`${formatDate(
            item?.tgl_awal
          )} - ${formatDate(
            item?.tgl_akhir
          )}`}
        />

        <DetailItem
          icon={
            <MapPin size={18} />
          }
          label="Tempat Uji Kompetensi"
          value={
            tuk?.nama_tuk ||
            item?.nama_tuk ||
            "-"
          }
        />

        <DetailItem
          icon={
            <Clock size={18} />
          }
          label="Pelaksanaan Uji"
          value={
            item?.pelaksanaan_uji ||
            "-"
          }
        />

        <DetailItem
          icon={
            <Users size={18} />
          }
          label="Kuota Peserta"
          value={`${item?.kuota || 0} Peserta`}
        />
      </div>

      <div className="border-t border-[#071E3D]/10 bg-[#FAFAFA] px-5 py-4 md:px-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#182D4A]/60">
              Tim Asesmen
            </p>

            <p className="mt-1 text-[11px] font-medium text-[#182D4A]/50">
              {totalTeam} penugasan
              tercatat
            </p>
          </div>

          <span className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-[10px] font-bold text-[#071E3D]">
            <Users
              size={14}
              className="text-[#CC6B27]"
            />
            {totalAsesor} Asesor
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <TeamItem
            label="Penguji"
            count={
              summary
                ?.asesor_penguji
                ?.count ||
              0
            }
            icon={
              <UserCheck
                size={13}
              />
            }
          />

          <TeamItem
            label="Verif TUK"
            count={
              summary
                ?.verifikator_tuk
                ?.count ||
              0
            }
            icon={
              <CheckCircle
                size={13}
              />
            }
          />

          <TeamItem
            label="MKVA"
            count={
              summary
                ?.validator_mkva
                ?.count ||
              0
            }
            icon={
              <FileCheck
                size={13}
              />
            }
          />

          <TeamItem
            label="Komite"
            count={
              summary
                ?.komite_teknis
                ?.count ||
              0
            }
            icon={
              <UserCog
                size={13}
              />
            }
          />
        </div>

        {!isMandiri &&
          totalAsesor ===
            0 && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[10px] font-semibold text-slate-400">
              <Inbox
                size={14}
              />
              Data penugasan asesor
              tersedia untuk TUK
              mandiri.
            </div>
          )}
      </div>

      <div className="border-t border-[#071E3D]/10 bg-white px-5 py-5 md:px-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#182D4A]/60">
              Pengelolaan Jadwal
            </p>

            <p className="mt-1 text-[12px] font-medium text-[#182D4A]/55">
              {isMandiri
                ? "Kelola tim asesor sesuai kebutuhan jadwal."
                : "Jadwal ini dikelola oleh admin."}
            </p>
          </div>

          <span className="text-[10px] font-bold text-[#182D4A]/40">
            ID Jadwal:{" "}
            {item?.id_jadwal ||
              "-"}
          </span>
        </div>

        {!isMandiri ? (
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <ShieldCheck
              size={17}
              className="shrink-0 text-[#CC6B27]"
            />

            <div>
              <p className="text-[11px] font-bold text-[#071E3D]">
                Mode Lihat Saja
              </p>

              <p className="mt-0.5 text-[10px] font-medium text-[#182D4A]/55">
                Jadwal dibuat dan dikelola
                oleh Administrator.
              </p>
            </div>
          </div>
        ) : isDraft ? (
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
            <ActionButton
              icon={
                <Pencil
                  size={15}
                />
              }
              title="Edit Draft"
              onClick={
                onEdit
              }
            />

            <ActionButton
              icon={
                <Trash2
                  size={15}
                />
              }
              title="Hapus Draft"
              onClick={
                onDelete
              }
              variant="danger"
            />

            <div className="flex items-center gap-2 rounded-lg border border-orange-100 bg-orange-50 px-4 py-3 text-[10px] font-semibold text-orange-700 lg:col-span-2">
              <AlertCircle
                size={15}
                className="shrink-0"
              />

              Jadwal masih berstatus
              draft dan menunggu proses
              pengajuan.
            </div>
          </div>
        ) : isDitolak ? (
          <div className="flex items-center gap-3 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-[10px] font-semibold leading-relaxed text-red-700">
            <XCircle
              size={17}
              className="shrink-0"
            />

            <span>
              Jadwal ditolak dan tidak dapat
              dikelola sampai ada perubahan
              status dari administrator.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <ActionButton
              icon={
                <UserCheck
                  size={15}
                />
              }
              title="Asesor Penguji"
              onClick={
                onPenguji
              }
            />

            <ActionButton
              icon={
                <CheckCircle
                  size={15}
                />
              }
              title="Verifikasi TUK"
              onClick={
                onVerifikasi
              }
            />

            <ActionButton
              icon={
                <FileCheck
                  size={15}
                />
              }
              title="Validator MKVA"
              onClick={
                onValidator
              }
            />

            <ActionButton
              icon={
                <UserCog
                  size={15}
                />
              }
              title="Komite Teknis"
              onClick={
                onKomite
              }
            />
          </div>
        )}

        {canManage && (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={
                onPenguji
              }
              className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#CC6B27] transition-colors hover:text-[#071E3D]"
            >
              Kelola Detail
              <ChevronRight
                size={13}
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

function TeamItem({
  label,
  count,
  icon,
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-[#071E3D]/10 bg-white px-3 py-2.5">
      <span className="flex min-w-0 items-center gap-2 text-[10px] font-bold text-[#182D4A]/55">
        <span className="shrink-0 text-[#CC6B27]">
          {icon}
        </span>

        <span className="truncate">
          {label}
        </span>
      </span>

      <span className="shrink-0 text-[11px] font-black text-[#071E3D]">
        {count}
      </span>
    </div>
  );
}

function ActionButton({
  icon,
  title,
  onClick,
  variant = "primary",
}) {
  const classes =
    variant ===
    "danger"
      ? "border border-red-200 bg-white text-red-600 hover:border-red-500 hover:bg-red-500 hover:text-white"
      : "border border-[#CC6B27] bg-[#CC6B27] text-white hover:border-[#A8561F] hover:bg-[#A8561F]";

  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-4 py-3 text-[11px] font-bold transition-all ${classes}`}
    >
      {icon}
      {title}
    </button>
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
    blue:
      "bg-blue-50 text-blue-600",
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

function LoadingState() {
  return (
    <div className="w-full max-w-md rounded-xl border border-[#071E3D]/10 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
        <Loader2
          size={25}
          className="animate-spin"
        />
      </div>

      <p className="text-[15px] font-black text-[#071E3D]">
        Memuat Data Jadwal
      </p>

      <p className="mt-1 text-[11px] font-medium text-[#182D4A]/55">
        Mohon tunggu sebentar...
      </p>
    </div>
  );
}

function EmptyState({
  search,
}) {
  return (
    <div className="rounded-lg border border-dashed border-[#071E3D]/15 bg-[#FAFAFA] px-6 py-14 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white text-[#071E3D]/25">
        {search ? (
          <Search
            size={28}
          />
        ) : (
          <Inbox
            size={28}
          />
        )}
      </div>

      <h3 className="text-[15px] font-black text-[#071E3D]">
        {search
          ? "Jadwal Tidak Ditemukan"
          : "Belum Ada Jadwal"}
      </h3>

      <p className="mx-auto mt-1 max-w-md text-[11px] font-medium leading-5 text-[#182D4A]/55">
        {search
          ? "Kata kunci pencarian tidak cocok dengan data jadwal yang tersedia."
          : "Belum ada jadwal sertifikasi yang tersedia untuk ditampilkan."}
      </p>
    </div>
  );
}

function DeleteModal({
  deleting,
  onCancel,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#071E3D]/50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-2xl">
        <div className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-5 py-4">
          <h2 className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-white">
            <Trash2
              size={16}
              className="text-[#CC6B27]"
            />
            Konfirmasi Penghapusan
          </h2>
        </div>

        <div className="p-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 text-red-500">
            <AlertCircle
              size={25}
            />
          </div>

          <h3 className="text-center text-[18px] font-black text-[#071E3D]">
            Hapus Jadwal?
          </h3>

          <p className="mt-2 text-center text-[12px] font-medium leading-5 text-[#182D4A]/60">
            Jadwal yang dihapus tidak dapat
            dikembalikan. Pastikan Anda
            benar-benar ingin menghapus data
            ini.
          </p>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={
                onCancel
              }
              disabled={
                deleting
              }
              className="rounded-lg border border-[#071E3D]/15 bg-white px-5 py-2.5 text-[11px] font-bold text-[#071E3D] transition-all hover:border-[#071E3D] hover:bg-[#071E3D] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={
                onConfirm
              }
              disabled={
                deleting
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500 px-5 py-2.5 text-[11px] font-bold text-white transition-all hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {deleting ? (
                <Loader2
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <Trash2
                  size={15}
                />
              )}

              {deleting
                ? "Menghapus..."
                : "Hapus Jadwal"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListJadwal;