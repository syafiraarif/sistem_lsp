import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  AlertCircle,
  CalendarCheck,
  CalendarDays,
  CheckCircle,
  ChevronLeft,
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

const ITEMS_PER_PAGE = 3;

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
  },
  (error) =>
    Promise.reject(error)
);

const sleep = (
  ms
) =>
  new Promise(
    (resolve) =>
      setTimeout(
        resolve,
        ms
      )
  );

const requestWithRetry =
  async (
    request,
    maxRetries = 2
  ) => {
    let lastError;

    for (
      let attempt = 0;
      attempt <=
      maxRetries;
      attempt += 1
    ) {
      try {
        return await request();
      } catch (error) {
        lastError =
          error;

        if (
          error?.response
            ?.status !==
            429 ||
          attempt ===
            maxRetries
        ) {
          throw error;
        }

        const retryAfter =
          error?.response
            ?.headers?.[
            "retry-after"
          ];

        const retrySeconds =
          Number(
            retryAfter
          );

        const delay =
          Number.isFinite(
            retrySeconds
          ) &&
          retrySeconds > 0
            ? Math.min(
                retrySeconds *
                  1000,
                10000
              )
            : Math.min(
                1200 *
                  Math.pow(
                    2,
                    attempt
                  ),
                8000
              );

        await sleep(
          delay
        );
      }
    }

    throw lastError;
  };

const getAsesorName = (
  item
) => {
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
};

const formatDate = (
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

const getStatusLabel = (
  status
) => {
  const labels = {
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

  return (
    labels[status] ||
    status ||
    "Arsip"
  );
};

const getStatusClass = (
  status
) => {
  if (
    status ===
      "disetujui" ||
    status ===
      "open"
  ) {
    return "border-green-100 bg-green-50 text-green-600";
  }

  if (
    status ===
    "ongoing"
  ) {
    return "border-blue-100 bg-blue-50 text-blue-600";
  }

  if (
    status ===
    "ditolak"
  ) {
    return "border-red-100 bg-red-50 text-red-600";
  }

  if (
    status ===
    "selesai"
  ) {
    return "border-slate-200 bg-slate-50 text-slate-600";
  }

  return "border-orange-100 bg-orange-50 text-orange-600";
};

const ListJadwal = () => {
  const navigate =
    useNavigate();

  const initialLoadRef =
    useRef(false);

  const summaryCacheRef =
    useRef(new Map());

  const summaryPromiseRef =
    useRef(new Map());

  const [jadwal, setJadwal] =
    useState([]);

  const [jenisTuk, setJenisTuk] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [summaryLoading, setSummaryLoading] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [filterStatus, setFilterStatus] =
    useState("semua");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [showModal, setShowModal] =
    useState(false);

  const [deleteId, setDeleteId] =
    useState(null);

  const [deleting, setDeleting] =
    useState(false);

  const isMandiri =
    jenisTuk ===
    "mandiri";

  const fetchProfileTuk =
    useCallback(
      async () => {
        return requestWithRetry(
          () =>
            api.get(
              "/tuk/profile"
            ),
          2
        );
      },
      []
    );

  const fetchJadwalBase =
    useCallback(
      async () => {
        return requestWithRetry(
          () =>
            api.get(
              "/tuk/jadwal"
            ),
          2
        );
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
          const response =
            await requestWithRetry(
              () =>
                api.get(
                  `${API}/${idJadwal}/asesor/${jenisTugas}`
                ),
              2
            );

          const data =
            Array.isArray(
              response.data?.data
            )
              ? response.data
                  .data
              : [];

          return {
            count:
              data.length,
            names: data
              .map(
                getAsesorName
              )
              .filter(
                (name) =>
                  name &&
                  name !== "-"
              )
              .slice(
                0,
                2
              ),
          };
        } catch (error) {
          console.warn(
            `Gagal fetch ${jenisTugas} jadwal ${idJadwal}:`,
            error
          );

          return {
            count: 0,
            names: [],
          };
        }
      },
      []
    );

  const loadAssignmentSummary =
    useCallback(
      async (
        idJadwal
      ) => {
        if (
          summaryCacheRef.current.has(
            idJadwal
          )
        ) {
          return summaryCacheRef.current.get(
            idJadwal
          );
        }

        if (
          summaryPromiseRef.current.has(
            idJadwal
          )
        ) {
          return summaryPromiseRef.current.get(
            idJadwal
          );
        }

        const promise =
          (async () => {
            const summary = {
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

            const taskList = [
              "asesor_penguji",
              "verifikator_tuk",
              "validator_mkva",
              "komite_teknis",
            ];

            for (
              let index = 0;
              index <
              taskList.length;
              index +=
                1
            ) {
              const jenisTugas =
                taskList[
                  index
                ];

              summary[
                jenisTugas
              ] =
                await fetchAsesorByJenis(
                  idJadwal,
                  jenisTugas
                );

              if (
                index <
                taskList.length -
                  1
              ) {
                await sleep(
                  200
                );
              }
            }

            summaryCacheRef.current.set(
              idJadwal,
              summary
            );

            return summary;
          })();

        summaryPromiseRef.current.set(
          idJadwal,
          promise
        );

        try {
          return await promise;
        } finally {
          summaryPromiseRef.current.delete(
            idJadwal
          );
        }
      },
      [
        fetchAsesorByJenis,
      ]
    );

  const loadPageData =
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
            localStorage.clear();

            await notifikasi.peringatan(
              "Sesi Berakhir",
              "Silakan login kembali untuk melanjutkan."
            );

            navigate(
              "/login",
              {
                replace: true,
              }
            );

            return false;
          }

          const profileRes =
            await fetchProfileTuk();

          const currentJenisTuk =
            profileRes?.data
              ?.data?.tuk
              ?.jenis_tuk ||
            profileRes?.data
              ?.jenis_tuk ||
            "";

          setJenisTuk(
            currentJenisTuk
          );

          await sleep(
            100
          );

          const jadwalRes =
            await fetchJadwalBase();

          const jadwalList =
            Array.isArray(
              jadwalRes?.data
                ?.data
            )
              ? jadwalRes.data
                  .data
              : [];

          summaryCacheRef.current.clear();
          summaryPromiseRef.current.clear();

          const baseJadwal =
            jadwalList.map(
              (
                item
              ) => ({
                ...item,
                asesorSummary:
                  emptySummary,
              })
            );

          setJadwal(
            baseJadwal
          );

          setCurrentPage(
            1
          );

          return true;
        } catch (error) {
          console.error(
            "Gagal memuat data List Jadwal:",
            error
          );

          if (
            error?.response
              ?.status ===
            401
          ) {
            localStorage.clear();

            await notifikasi.peringatan(
              "Sesi Berakhir",
              "Sesi login Anda telah berakhir. Silakan login kembali."
            );

            navigate(
              "/login",
              {
                replace: true,
              }
            );

            return false;
          }

          if (
            error?.response
              ?.status ===
            429
          ) {
            await notifikasi.peringatan(
              "Terlalu Banyak Permintaan",
              "Server sedang membatasi jumlah permintaan. Tunggu beberapa saat lalu coba lagi."
            );

            return false;
          }

          await notifikasi.gagal(
            "Gagal Memuat Jadwal",
            error?.response
              ?.data
              ?.message ||
              "Data jadwal gagal dimuat."
          );

          setJadwal([]);

          return false;
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [
        fetchProfileTuk,
        fetchJadwalBase,
        navigate,
      ]
    );

  useEffect(() => {
    if (
      initialLoadRef.current
    ) {
      return;
    }

    initialLoadRef.current =
      true;

    loadPageData();
  }, [
    loadPageData,
  ]);

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

          const tuk =
            item?.tuk ||
            item?.Tuk ||
            {};

          const searchableText =
            [
              item?.nama_kegiatan,
              item?.kode_jadwal,
              item?.status,
              item?.pelaksanaan_uji,
              item?.lokasi,
              item?.nama_tuk,
              skema?.judul_skema,
              skema?.kode_skema,
              tuk?.nama_tuk,
              tuk?.nama,
              tuk?.alamat,
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
            item?.status ===
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

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredJadwal.length /
          ITEMS_PER_PAGE
      )
    );

  const paginatedJadwal =
    useMemo(() => {
      const start =
        (currentPage -
          1) *
        ITEMS_PER_PAGE;

      return filteredJadwal.slice(
        start,
        start +
          ITEMS_PER_PAGE
      );
    }, [
      filteredJadwal,
      currentPage,
    ]);

  const pageKey =
    paginatedJadwal
      .map(
        (item) =>
          item.id_jadwal
      )
      .join(",");

  useEffect(() => {
    setCurrentPage(
      1
    );
  }, [
    search,
    filterStatus,
  ]);

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

  useEffect(() => {
    if (
      !isMandiri ||
      paginatedJadwal.length ===
        0
    ) {
      setSummaryLoading(
        false
      );

      return;
    }

    let cancelled =
      false;

    const loadCurrentPageSummary =
      async () => {
        setSummaryLoading(
          true
        );

        try {
          for (
            const item of paginatedJadwal
          ) {
            if (
              cancelled
            ) {
              return;
            }

            if (
              item.status ===
                "draft" ||
              item.status ===
                "ditolak"
            ) {
              continue;
            }

            const summary =
              await loadAssignmentSummary(
                item.id_jadwal
              );

            if (
              cancelled
            ) {
              return;
            }

            setJadwal(
              (prev) =>
                prev.map(
                  (
                    jadwalItem
                  ) =>
                    jadwalItem.id_jadwal ===
                    item.id_jadwal
                      ? {
                          ...jadwalItem,
                          asesorSummary:
                            summary,
                        }
                      : jadwalItem
                )
            );

            await sleep(
              200
            );
          }
        } finally {
          if (
            !cancelled
          ) {
            setSummaryLoading(
              false
            );
          }
        }
      };

    loadCurrentPageSummary();

    return () => {
      cancelled =
        true;
    };
  }, [
    pageKey,
    isMandiri,
    loadAssignmentSummary,
  ]);

  const handlePageChange =
    (page) => {
      if (
        page < 1 ||
        page > totalPages ||
        page ===
          currentPage
      ) {
        return;
      }

      setCurrentPage(
        page
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

  const handleRefresh =
    async () => {
      if (
        loading ||
        refreshing
      ) {
        return;
      }

      const success =
        await loadPageData(
          false
        );

      if (
        success
      ) {
        await notifikasi.sukses(
          "Data Diperbarui",
          "Daftar jadwal berhasil disegarkan."
        );
      }
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

        await requestWithRetry(
          () =>
            api.delete(
              `${API}/${deleteId}`
            ),
          2
        );

        summaryCacheRef.current.clear();
        summaryPromiseRef.current.clear();

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

        await loadPageData(
          false
        );
      } catch (error) {
        console.error(
          "Gagal menghapus jadwal:",
          error
        );

        if (
          error?.response
            ?.status ===
          429
        ) {
          await notifikasi.peringatan(
            "Terlalu Banyak Permintaan",
            "Server sedang membatasi permintaan. Coba lagi beberapa saat."
          );

          return;
        }

        await notifikasi.gagal(
          "Gagal Menghapus",
          error?.response
            ?.data
            ?.message ||
            "Jadwal gagal dihapus."
        );
      } finally {
        setDeleting(
          false
        );
      }
    };

  const getTotalAsesor =
    (
      summary = {}
    ) => {
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
                    kode, skema, atau status jadwal.
                  </p>

                  <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-[#182D4A]/40">
                    {filteredJadwal.length} jadwal
                    ditemukan
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
                          e.target.value
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
                          e.target.value
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
              {paginatedJadwal.length ===
              0 ? (
                <EmptyState
                  search={
                    search
                  }
                />
              ) : (
                <div className="space-y-3">
                  {paginatedJadwal.map(
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
                        summaryLoading={
                          summaryLoading
                        }
                        getTotalAsesor={
                          getTotalAsesor
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

            {filteredJadwal.length >
              0 && (
              <Pagination
                currentPage={
                  currentPage
                }
                totalPages={
                  totalPages
                }
                totalItems={
                  filteredJadwal.length
                }
                itemsPerPage={
                  ITEMS_PER_PAGE
                }
                onPageChange={
                  handlePageChange
                }
              />
            )}
          </section>

          <div className="flex flex-col gap-1 text-right text-[11px] font-bold text-[#182D4A]/45 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Menampilkan{" "}
              <span className="text-[#071E3D]">
                {Math.min(
                  (currentPage -
                    1) *
                    ITEMS_PER_PAGE +
                    1,
                  filteredJadwal.length
                )}
                -
                {Math.min(
                  currentPage *
                    ITEMS_PER_PAGE,
                  filteredJadwal.length
                )}
              </span>{" "}
              dari{" "}
              <span className="text-[#071E3D]">
                {
                  filteredJadwal.length
                }
              </span>{" "}
              jadwal
            </span>

            <span>
              Halaman{" "}
              <span className="text-[#071E3D]">
                {currentPage}
              </span>{" "}
              dari{" "}
              <span className="text-[#071E3D]">
                {totalPages}
              </span>
            </span>
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

const ScheduleCard = ({
  item,
  isMandiri,
  summaryLoading,
  getTotalAsesor,
  onEdit,
  onDelete,
  onPenguji,
  onVerifikasi,
  onValidator,
  onKomite,
}) => {
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

  const isDraft =
    item?.status ===
    "draft";

  const isDitolak =
    item?.status ===
    "ditolak";

  const totalAsesor =
    getTotalAsesor(
      summary
    );

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
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
            <ClipboardList
              size={21}
            />
          </div>

          <div className="h-10 w-px shrink-0 bg-[#071E3D]/10" />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {item?.kode_jadwal && (
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

              <span
                className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider ${getStatusClass(
                  item?.status
                )}`}
              >
                {getStatusLabel(
                  item?.status
                )}
              </span>

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
          value={
            item?.tgl_awal &&
            item?.tgl_akhir
              ? `${formatDate(
                  item.tgl_awal
                )} - ${formatDate(
                  item.tgl_akhir
                )}`
              : formatDate(
                  item?.tgl_awal
                )
          }
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
              {summaryLoading &&
              isMandiri &&
              !isDraft &&
              !isDitolak ? (
                <span className="inline-flex items-center gap-1.5">
                  <Loader2
                    size={12}
                    className="animate-spin text-[#CC6B27]"
                  />
                  Memuat penugasan...
                </span>
              ) : (
                `${totalTeam} penugasan tercatat`
              )}
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
            names={
              summary
                ?.asesor_penguji
                ?.names
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
            names={
              summary
                ?.verifikator_tuk
                ?.names
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
            names={
              summary
                ?.validator_mkva
                ?.names
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
            names={
              summary
                ?.komite_teknis
                ?.names
            }
            icon={
              <UserCog
                size={13}
              />
            }
          />
        </div>

        {!isMandiri && (
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
                Jadwal dibuat dan
                dikelola oleh
                Administrator.
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

              Jadwal masih
              berstatus draft dan
              menunggu proses
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
              Jadwal ditolak dan
              tidak dapat dikelola
              sampai ada perubahan
              status dari
              administrator.
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
      </div>
    </article>
  );
};

const DetailItem = ({
  icon,
  label,
  value,
}) => {
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
};

const TeamItem = ({
  label,
  count,
  names = [],
  icon,
}) => {
  return (
    <div className="min-h-[58px] rounded-lg border border-[#071E3D]/10 bg-white px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
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

      {names.length >
        0 && (
        <p className="mt-1 truncate pl-5 text-[9px] font-medium text-[#182D4A]/45">
          {names.join(
            ", "
          )}
        </p>
      )}
    </div>
  );
};

const ActionButton = ({
  icon,
  title,
  onClick,
  variant = "primary",
}) => {
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
      <ChevronRight
        size={13}
        className="ml-auto opacity-70"
      />
    </button>
  );
};

const StatCard = ({
  icon,
  label,
  value,
  tone = "orange",
}) => {
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
};

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const startItem =
    totalItems === 0
      ? 0
      : (currentPage -
          1) *
          itemsPerPage +
        1;

  const endItem =
    Math.min(
      currentPage *
        itemsPerPage,
      totalItems
    );

  const getPageNumbers =
    () => {
      if (
        totalPages <=
        5
      ) {
        return Array.from(
          {
            length:
              totalPages,
          },
          (_, index) =>
            index + 1
        );
      }

      if (
        currentPage <=
        3
      ) {
        return [
          1,
          2,
          3,
          4,
          "...",
          totalPages,
        ];
      }

      if (
        currentPage >=
        totalPages - 2
      ) {
        return [
          1,
          "...",
          totalPages -
            3,
          totalPages -
            2,
          totalPages -
            1,
          totalPages,
        ];
      }

      return [
        1,
        "...",
        currentPage -
          1,
        currentPage,
        currentPage +
          1,
        "...",
        totalPages,
      ];
    };

  return (
    <div className="border-t border-[#071E3D]/10 bg-[#FAFAFA] px-5 py-4 md:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-[10px] font-bold text-[#182D4A]/50">
          Menampilkan{" "}
          <span className="text-[#071E3D]">
            {startItem}
          </span>
          -
          <span className="text-[#071E3D]">
            {endItem}
          </span>{" "}
          dari{" "}
          <span className="text-[#071E3D]">
            {totalItems}
          </span>{" "}
          jadwal
        </p>

        {totalPages >
          1 && (
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() =>
                onPageChange(
                  currentPage -
                    1
                )
              }
              disabled={
                currentPage ===
                1
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#071E3D]/15 bg-white text-[#071E3D] transition-all hover:border-[#CC6B27] hover:text-[#CC6B27] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft
                size={15}
              />
            </button>

            <div className="flex items-center gap-1">
              {getPageNumbers().map(
                (
                  page,
                  index
                ) =>
                  page ===
                  "..." ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="flex h-9 w-7 items-center justify-center text-[11px] font-bold text-[#182D4A]/40"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={
                        page
                      }
                      type="button"
                      onClick={() =>
                        onPageChange(
                          page
                        )
                      }
                      className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-[10px] font-bold transition-all ${
                        currentPage ===
                        page
                          ? "bg-[#CC6B27] text-white"
                          : "border border-[#071E3D]/15 bg-white text-[#071E3D] hover:border-[#CC6B27] hover:text-[#CC6B27]"
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
                  currentPage +
                    1
                )
              }
              disabled={
                currentPage ===
                totalPages
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#071E3D]/15 bg-white text-[#071E3D] transition-all hover:border-[#CC6B27] hover:text-[#CC6B27] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight
                size={15}
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const LoadingState =
  () => {
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
  };

const EmptyState = ({
  search,
}) => {
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
};

const DeleteModal = ({
  deleting,
  onCancel,
  onConfirm,
}) => {
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
            Jadwal yang dihapus tidak
            dapat dikembalikan. Pastikan
            Anda benar-benar ingin menghapus
            data ini.
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
};

export default ListJadwal;