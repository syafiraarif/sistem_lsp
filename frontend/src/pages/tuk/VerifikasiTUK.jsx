import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import SidebarTUK from "../../components/sidebar/SidebarTuk";
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  Calendar,
  CheckCircle,
  ClipboardList,
  Hash,
  Inbox,
  Loader2,
  Phone,
  RefreshCcw,
  Search,
  ShieldCheck,
  Trash2,
  User,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { notifikasi } from "../../components/ui/notifikasi";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "http://localhost:3000/api";

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

const VerifikasiTUK = () => {
  const { id } =
    useParams();

  const navigate =
    useNavigate();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [jadwal, setJadwal] =
    useState(null);

  const [asesorJadwal, setAsesorJadwal] =
    useState([]);

  const [allAsesor, setAllAsesor] =
    useState([]);

  const [selected, setSelected] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const normalizeActiveAsesor =
    useCallback(
      (item) => {
        const profile =
          item?.profileAsesor ||
          item ||
          {};

        const user =
          item?.asesor ||
          item?.user ||
          {};

        return {
          id_user:
            item?.id_user ||
            item?.asesor?.id_user ||
            item?.profileAsesor
              ?.id_user ||
            item?.id_asesor ||
            null,
          nama_lengkap:
            profile?.nama_lengkap ||
            item?.nama_lengkap ||
            user?.nama_lengkap ||
            user?.username ||
            "-",
          bidang_keahlian:
            profile?.bidang_keahlian ||
            item?.bidang_keahlian ||
            "-",
          no_reg_asesor:
            profile?.no_reg_asesor ||
            item?.no_reg_asesor ||
            "-",
          no_lisensi:
            profile?.no_lisensi ||
            item?.no_lisensi ||
            "-",
          username:
            user?.username ||
            item?.username ||
            "-",
          no_hp:
            user?.no_hp ||
            item?.no_hp ||
            profile?.no_hp ||
            "-",
        };
      },
      []
    );

  const normalizeAvailableAsesor =
    useCallback(
      (item) => {
        const user =
          item?.user ||
          item?.asesor ||
          {};

        const profile =
          item?.profileAsesor ||
          {};

        return {
          id_user:
            item?.id_user ||
            user?.id_user ||
            item?.id_asesor ||
            profile?.id_user ||
            null,
          nama_lengkap:
            item?.nama_lengkap ||
            profile?.nama_lengkap ||
            user?.nama_lengkap ||
            user?.username ||
            "-",
          bidang_keahlian:
            item?.bidang_keahlian ||
            profile?.bidang_keahlian ||
            "-",
          no_reg_asesor:
            item?.no_reg_asesor ||
            profile?.no_reg_asesor ||
            "-",
          no_lisensi:
            item?.no_lisensi ||
            profile?.no_lisensi ||
            "-",
          username:
            user?.username ||
            item?.username ||
            "-",
          no_hp:
            user?.no_hp ||
            item?.no_hp ||
            profile?.no_hp ||
            "-",
        };
      },
      []
    );

  const activeAsesor =
    useMemo(() => {
      return asesorJadwal
        .map(
          normalizeActiveAsesor
        )
        .filter(
          (item) =>
            item.id_user
        );
    }, [
      asesorJadwal,
      normalizeActiveAsesor,
    ]);

  const activeIds =
    useMemo(() => {
      return new Set(
        activeAsesor.map(
          (item) =>
            Number(
              item.id_user
            )
        )
      );
    }, [activeAsesor]);

  const normalizedAllAsesor =
    useMemo(() => {
      return allAsesor
        .map(
          normalizeAvailableAsesor
        )
        .filter(
          (item) =>
            item.id_user
        );
    }, [
      allAsesor,
      normalizeAvailableAsesor,
    ]);

  const availableCount =
    useMemo(() => {
      return normalizedAllAsesor.filter(
        (item) =>
          !activeIds.has(
            Number(
              item.id_user
            )
          )
      ).length;
    }, [
      normalizedAllAsesor,
      activeIds,
    ]);

  const filteredAsesor =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      if (!keyword) {
        return normalizedAllAsesor;
      }

      return normalizedAllAsesor.filter(
        (asesor) =>
          String(
            asesor.nama_lengkap
          )
            .toLowerCase()
            .includes(keyword) ||
          String(
            asesor.no_reg_asesor
          )
            .toLowerCase()
            .includes(keyword) ||
          String(
            asesor.username
          )
            .toLowerCase()
            .includes(keyword) ||
          String(
            asesor.no_hp
          )
            .toLowerCase()
            .includes(keyword) ||
          String(
            asesor.bidang_keahlian
          )
            .toLowerCase()
            .includes(keyword)
      );
    }, [
      normalizedAllAsesor,
      search,
    ]);

  const fetchData =
    useCallback(
      async (
        showLoading = true
      ) => {
        try {
          if (showLoading) {
            setLoading(true);
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
            navigate("/login");
            return;
          }

          const [
            resJadwal,
            resAsesorJadwal,
            resAllAsesor,
          ] = await Promise.all([
            api.get(
              `/tuk/jadwal/${id}`
            ),
            api.get(
              `/tuk/jadwal/${id}/asesor/verifikator_tuk`
            ),
            api.get(
              "/tuk/asesor"
            ),
          ]);

          setJadwal(
            resJadwal.data?.data ||
              null
          );

          setAsesorJadwal(
            Array.isArray(
              resAsesorJadwal
                .data?.data
            )
              ? resAsesorJadwal.data
                  .data
              : []
          );

          setAllAsesor(
            Array.isArray(
              resAllAsesor
                .data?.data
            )
              ? resAllAsesor.data
                  .data
              : []
          );
        } catch (err) {
          console.error(
            "Error fetch verifikasi TUK:",
            err?.response?.data ||
              err
          );

          const status =
            err?.response?.status;

          const message =
            err?.response?.data
              ?.message ||
            err?.response?.data
              ?.error ||
            "Gagal memuat data verifikasi TUK.";

          if (
            status === 401
          ) {
            await notifikasi.peringatan(
              "Sesi Berakhir",
              "Sesi login Anda telah berakhir. Silakan login kembali."
            );

            localStorage.clear();
            navigate("/login");
            return;
          }

          if (
            status === 404
          ) {
            await notifikasi.peringatan(
              "Jadwal Tidak Ditemukan",
              "Jadwal yang Anda cari tidak ditemukan atau sudah tidak tersedia."
            );

            navigate(
              "/tuk/jadwal"
            );
            return;
          }

          await notifikasi.gagal(
            "Gagal Memuat Data",
            message
          );
        } finally {
          if (showLoading) {
            setLoading(false);
          }

          setRefreshing(false);
        }
      },
      [id, navigate]
    );

  useEffect(() => {
    const token =
      localStorage.getItem(
        "token"
      );

    if (!token) {
      navigate("/login");
      return;
    }

    if (id) {
      fetchData();
    }
  }, [
    id,
    navigate,
    fetchData,
  ]);

  const handleRefresh =
    async () => {
      if (
        loading ||
        refreshing
      ) {
        return;
      }

      setRefreshing(true);

      await fetchData(false);

      await notifikasi.sukses(
        "Data Diperbarui",
        "Data verifikator TUK berhasil disegarkan."
      );
    };

  const handleAdd =
    useCallback(
      (id_user) => {
        const parsedId =
          Number(id_user);

        if (
          activeIds.has(
            parsedId
          )
        ) {
          return;
        }

        if (
          selected.includes(
            parsedId
          )
        ) {
          return;
        }

        setSelected(
          (prev) => [
            ...prev,
            parsedId,
          ]
        );
      },
      [
        activeIds,
        selected,
      ]
    );

  const handleRemove =
    useCallback(
      (id_user) => {
        const parsedId =
          Number(id_user);

        setSelected(
          (prev) =>
            prev.filter(
              (item) =>
                Number(
                  item
                ) !==
                parsedId
            )
        );
      },
      []
    );

  const handleSave =
    useCallback(
      async () => {
        if (
          selected.length ===
          0
        ) {
          await notifikasi.peringatan(
            "Verifikator Belum Dipilih",
            "Pilih minimal 1 asesor verifikator terlebih dahulu."
          );
          return;
        }

        const mergedIds = [
          ...new Set([
            ...Array.from(
              activeIds
            ),
            ...selected.map(
              (item) =>
                Number(item)
            ),
          ]),
        ];

        try {
          setSaving(true);

          const payload = {
            listAsesor:
              mergedIds.map(
                (id_user) => ({
                  id_user:
                    Number(
                      id_user
                    ),
                })
              ),
          };

          const res =
            await api.post(
              `/tuk/jadwal/${id}/asesor/verifikator_tuk`,
              payload
            );

          setSelected([]);

          await notifikasi.sukses(
            "Berhasil",
            res.data?.message ||
              "Verifikator TUK berhasil disimpan."
          );

          await fetchData(false);
        } catch (err) {
          console.error(
            "Error save verifikasi TUK:",
            err?.response?.data ||
              err
          );

          await notifikasi.gagal(
            "Gagal Menyimpan",
            err?.response
              ?.data?.message ||
              err?.response
                ?.data?.error ||
              "Gagal menyimpan verifikator TUK."
          );
        } finally {
          setSaving(false);
        }
      },
      [
        id,
        activeIds,
        selected,
        fetchData,
      ]
    );

  const handleDeleteAsesor =
    useCallback(
      async (
        id_user,
        nama =
          "verifikator ini"
      ) => {
        const confirmed =
          window.confirm(
            `Hapus ${nama} dari verifikasi TUK?`
          );

        if (!confirmed) {
          return;
        }

        try {
          await api.delete(
            `/tuk/jadwal/${id}/asesor/verifikator_tuk/${id_user}`
          );

          setSelected(
            (prev) =>
              prev.filter(
                (item) =>
                  Number(
                    item
                  ) !==
                  Number(
                    id_user
                  )
              )
          );

          await notifikasi.sukses(
            "Berhasil",
            `${nama} berhasil dihapus dari verifikator TUK.`
          );

          await fetchData(
            false
          );
        } catch (err) {
          console.error(
            "Error delete verifikasi TUK:",
            err?.response?.data ||
              err
          );

          await notifikasi.gagal(
            "Gagal Menghapus",
            err?.response
              ?.data?.message ||
              err?.response
                ?.data?.error ||
              "Gagal menghapus verifikator TUK."
          );
        }
      },
      [
        id,
        fetchData,
      ]
    );

  const handleLogout =
    useCallback(() => {
      localStorage.clear();
      navigate("/login");
    }, [navigate]);

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
          month: "short",
          year: "numeric",
        }
      );
    };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
        <div className="rounded-xl border border-[#071E3D]/10 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
            <Loader2
              size={25}
              className="animate-spin"
            />
          </div>

          <p className="text-[15px] font-black text-[#071E3D]">
            Memuat Verifikasi TUK
          </p>

          <p className="mt-1 text-[11px] font-medium text-[#182D4A]/55">
            Mohon tunggu sebentar...
          </p>
        </div>
      </div>
    );
  }

  if (!jadwal) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] p-6">
        <div className="w-full max-w-md rounded-xl border border-[#071E3D]/10 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
            <Inbox size={28} />
          </div>

          <h2 className="text-[20px] font-black text-[#071E3D]">
            Jadwal Tidak Ditemukan
          </h2>

          <p className="mt-2 text-[12px] font-medium leading-5 text-[#182D4A]/60">
            Jadwal yang Anda cari tidak
            ditemukan atau Anda tidak
            memiliki akses.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/tuk/jadwal"
              )
            }
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#CC6B27] px-5 py-2.5 text-[12px] font-bold text-white shadow-sm transition-all hover:bg-[#071E3D]"
          >
            <ArrowLeft
              size={16}
            />
            Kembali ke Jadwal
          </button>
        </div>
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

      <main className="flex-1 overflow-x-hidden p-4 transition-all duration-300 md:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-[1500px] space-y-5">
          <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
            <div className="border-b border-[#071E3D]/10 px-5 py-5 md:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(-1)
                    }
                    className="mb-3 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#182D4A]/50 transition-colors hover:text-[#CC6B27]"
                  >
                    <ArrowLeft
                      size={15}
                    />
                    Kembali
                  </button>

                  <h1 className="text-[24px] font-black text-[#071E3D] md:text-[28px]">
                    Verifikasi{" "}
                    <span className="text-[#CC6B27]">
                      TUK
                    </span>
                  </h1>

                  <p className="mt-1 max-w-3xl text-[13px] font-medium leading-5 text-[#182D4A]/70">
                    Kelola asesor yang bertugas
                    sebagai verifikator TUK untuk
                    jadwal{" "}
                    <span className="font-bold text-[#071E3D]">
                      {jadwal.nama_kegiatan ||
                        "-"}
                    </span>
                    .
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    handleRefresh
                  }
                  disabled={
                    loading ||
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
                    <RefreshCcw
                      size={15}
                    />
                  )}
                  Refresh
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3 md:p-6">
              <MiniStat
                icon={
                  <UserCheck
                    size={22}
                  />
                }
                label="Verifikator Ditugaskan"
                value={
                  activeAsesor.length
                }
              />

              <MiniStat
                icon={
                  <UserPlus
                    size={22}
                  />
                }
                label="Verifikator Tersedia"
                value={
                  availableCount
                }
              />

              <MiniStat
                icon={
                  <CheckCircle
                    size={22}
                  />
                }
                label="Verifikator Dipilih"
                value={
                  selected.length
                }
                tone={
                  selected.length >
                  0
                    ? "orange"
                    : "blue"
                }
              />
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
            <SectionHeader
              title="Informasi Jadwal"
              icon={
                <ClipboardList
                  size={17}
                />
              }
            />

            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 md:p-6 xl:grid-cols-4">
              <InfoBox
                label="Skema"
                icon={
                  <Award
                    size={15}
                  />
                }
              >
                {jadwal?.skema
                  ?.judul_skema ||
                  jadwal?.nama_skema ||
                  "Belum ditentukan"}
              </InfoBox>

              <InfoBox
                label="Nama Kegiatan"
                icon={
                  <ClipboardList
                    size={15}
                  />
                }
              >
                {jadwal?.nama_kegiatan ||
                  "-"}
              </InfoBox>

              <InfoBox
                label="Periode"
                icon={
                  <Calendar
                    size={15}
                  />
                }
              >
                {formatDate(
                  jadwal?.tgl_awal
                )}{" "}
                -{" "}
                {formatDate(
                  jadwal?.tgl_akhir
                )}
              </InfoBox>

              <InfoBox
                label="Status Jadwal"
                icon={
                  <ShieldCheck
                    size={15}
                  />
                }
              >
                {jadwal?.status ||
                  "Aktif"}
              </InfoBox>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
            <SectionHeader
              title="Pilih Asesor Verifikator TUK"
              icon={
                <UserPlus
                  size={17}
                />
              }
              badge={
                filteredAsesor.length
              }
            />

            <div className="p-5 md:p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <LimitCard
                  label="Ditugaskan"
                  value={
                    activeAsesor.length
                  }
                  text="verifikator"
                  icon={
                    <UserCheck
                      size={18}
                    />
                  }
                />

                <LimitCard
                  label="Tersedia"
                  value={
                    availableCount
                  }
                  text="asesor"
                  icon={
                    <UserPlus
                      size={18}
                    />
                  }
                />

                <LimitCard
                  label="Dipilih"
                  value={
                    selected.length
                  }
                  text="baru"
                  icon={
                    <CheckCircle
                      size={18}
                    />
                  }
                  highlight={
                    selected.length >
                    0
                  }
                />
              </div>

              <div className="relative mt-5">
                <Search
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#182D4A]/40"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Cari nama, nomor registrasi, username, atau HP..."
                  className="w-full rounded-lg border border-[#071E3D]/15 bg-[#FAFAFA] py-3.5 pl-11 pr-4 text-[12px] font-medium text-[#071E3D] outline-none transition-all placeholder:text-[#182D4A]/40 focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
                />
              </div>

              <div className="mt-5">
                {filteredAsesor.length ===
                0 ? (
                  <EmptyState
                    icon={
                      <Search
                        size={30}
                      />
                    }
                    title={
                      search
                        ? "Asesor Tidak Ditemukan"
                        : "Belum Ada Asesor"
                    }
                    desc={
                      search
                        ? "Coba gunakan kata kunci pencarian yang berbeda."
                        : "Belum ada asesor yang tersedia."
                    }
                  />
                ) : (
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {filteredAsesor.map(
                      (asesor) => {
                        const idUser =
                          Number(
                            asesor.id_user
                          );

                        const isAssigned =
                          activeIds.has(
                            idUser
                          );

                        const isSelected =
                          selected.includes(
                            idUser
                          );

                        return (
                          <div
                            key={
                              asesor.id_user
                            }
                            className={`rounded-xl border p-4 transition-all ${
                              isAssigned
                                ? "border-green-200 bg-green-50/40"
                                : isSelected
                                ? "border-[#CC6B27] bg-[#CC6B27]/5"
                                : "border-[#071E3D]/10 bg-white hover:border-[#CC6B27]/40 hover:bg-[#FAFAFA]"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                                  isAssigned
                                    ? "bg-green-100 text-green-600"
                                    : isSelected
                                    ? "bg-[#CC6B27] text-white"
                                    : "bg-[#CC6B27]/10 text-[#CC6B27]"
                                }`}
                              >
                                {isAssigned ? (
                                  <BadgeCheck
                                    size={
                                      18
                                    }
                                  />
                                ) : isSelected ? (
                                  <CheckCircle
                                    size={
                                      18
                                    }
                                  />
                                ) : (
                                  <UserPlus
                                    size={
                                      18
                                    }
                                  />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <h3
                                  className="truncate text-[14px] font-black text-[#071E3D]"
                                  title={
                                    asesor.nama_lengkap
                                  }
                                >
                                  {
                                    asesor.nama_lengkap
                                  }
                                </h3>

                                <p className="mt-1 min-h-[16px] line-clamp-2 text-[10px] font-medium leading-4 text-[#182D4A]/55">
                                  {asesor.bidang_keahlian ||
                                    "Verifikator TUK"}
                                </p>
                              </div>

                              {isAssigned && (
                                <span className="shrink-0 rounded-lg border border-green-200 bg-green-50 px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-green-600">
                                  Aktif
                                </span>
                              )}
                            </div>

                            <div className="mt-4 space-y-2">
                              <MiniInfo
                                icon={
                                  <Hash
                                    size={
                                      13
                                    }
                                  />
                                }
                                label="Reg"
                                value={
                                  asesor.no_reg_asesor ||
                                  "-"
                                }
                              />

                              <MiniInfo
                                icon={
                                  <Phone
                                    size={
                                      13
                                    }
                                  />
                                }
                                label="HP"
                                value={
                                  asesor.no_hp ||
                                  "-"
                                }
                              />

                              <MiniInfo
                                icon={
                                  <Award
                                    size={
                                      13
                                    }
                                  />
                                }
                                label="Lisensi"
                                value={
                                  asesor.no_lisensi ||
                                  "-"
                                }
                              />
                            </div>

                            <div className="mt-4">
                              {isAssigned ? (
                                <>
                                  <div className="flex w-full items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-[11px] font-bold text-green-600">
                                    <BadgeCheck
                                      size={
                                        15
                                      }
                                    />
                                    Sudah Ditugaskan
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteAsesor(
                                        idUser,
                                        asesor.nama_lengkap
                                      )
                                    }
                                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-red-100 bg-white px-4 py-2.5 text-[11px] font-bold text-red-500 transition-all hover:border-red-500 hover:bg-red-500 hover:text-white"
                                  >
                                    <Trash2
                                      size={
                                        14
                                      }
                                    />
                                    Hapus dari Verifikasi
                                  </button>
                                </>
                              ) : isSelected ? (
                                <div className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#CC6B27]/20 bg-[#CC6B27]/10 px-4 py-2.5 text-[11px] font-bold text-[#CC6B27]">
                                  <BadgeCheck
                                    size={
                                      15
                                    }
                                  />
                                  Verifikator Sudah Dipilih
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleAdd(
                                      idUser
                                    )
                                  }
                                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#CC6B27] px-4 py-2.5 text-[11px] font-bold text-white shadow-sm transition-all hover:bg-[#071E3D]"
                                >
                                  <UserPlus
                                    size={
                                      15
                                    }
                                  />
                                  Pilih Verifikator
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </div>

              {selected.length >
                0 && (
                <div className="mt-5 overflow-hidden rounded-xl bg-[#071E3D]">
                  <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                        Verifikator Sudah Dipilih
                      </p>

                      <h3 className="mt-1 text-[18px] font-black text-white">
                        {
                          selected.length
                        }{" "}
                        Asesor
                      </h3>

                      <p className="mt-1 text-[11px] font-medium text-white/55">
                        Klik simpan untuk
                        menambahkan verifikator
                        ke jadwal.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={
                        handleSave
                      }
                      disabled={
                        saving
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#CC6B27] px-5 py-3 text-[11px] font-bold text-white shadow-sm transition-all hover:bg-white hover:text-[#071E3D] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? (
                        <Loader2
                          size={
                            15
                          }
                          className="animate-spin"
                        />
                      ) : (
                        <UserPlus
                          size={
                            15
                          }
                        />
                      )}

                      {saving
                        ? "Menyimpan..."
                        : `Simpan ${selected.length} Verifikator`}
                    </button>
                  </div>
                </div>
              )}

              {selected.length ===
                0 &&
                activeAsesor.length ===
                  0 && (
                  <div className="mt-5 rounded-lg border border-[#CC6B27]/15 bg-[#CC6B27]/5 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
                        <ShieldCheck
                          size={16}
                        />
                      </div>

                      <div>
                        <p className="text-[12px] font-bold text-[#071E3D]">
                          Ketentuan Verifikasi TUK
                        </p>

                        <p className="mt-1 text-[11px] font-medium leading-5 text-[#182D4A]/60">
                          Pilih asesor yang akan
                          bertugas sebagai
                          verifikator TUK pada
                          jadwal ini.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

function SectionHeader({
  title,
  icon,
  badge,
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b-4 border-[#CC6B27] bg-[#071E3D] px-5 py-3.5">
      <h2 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-white">
        <span className="text-[#CC6B27]">
          {icon}
        </span>

        {title}
      </h2>

      {badge !== undefined && (
        <span className="rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
    </div>
  );
}

function InfoBox({
  label,
  icon,
  children,
}) {
  return (
    <div className="rounded-lg border border-[#071E3D]/10 bg-[#FAFAFA] p-4">
      <div className="mb-2 flex items-center gap-2 text-[#182D4A]/50">
        <span className="text-[#CC6B27]">
          {icon}
        </span>

        <p className="text-[9px] font-bold uppercase tracking-widest">
          {label}
        </p>
      </div>

      <p className="text-[12px] font-bold leading-5 text-[#071E3D]">
        {children}
      </p>
    </div>
  );
}

function MiniInfo({
  icon,
  label,
  value,
}) {
  return (
    <div className="flex min-h-[36px] items-center gap-2 rounded-lg border border-[#071E3D]/10 bg-white px-3 py-2">
      <span className="shrink-0 text-[#CC6B27]">
        {icon}
      </span>

      <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider text-[#182D4A]/45">
        {label}:
      </span>

      <span className="min-w-0 truncate text-[10px] font-semibold text-[#182D4A]/70">
        {value || "-"}
      </span>
    </div>
  );
}

function MiniStat({
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

function LimitCard({
  label,
  value,
  text,
  icon,
  highlight = false,
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        highlight
          ? "border-[#CC6B27]/20 bg-[#CC6B27]/5"
          : "border-[#071E3D]/10 bg-[#FAFAFA]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-[#182D4A]/50">
            {label}
          </p>

          <div className="mt-1 flex items-end gap-2">
            <p className="text-[22px] font-black text-[#071E3D]">
              {value}
            </p>

            <span className="mb-1 text-[10px] font-bold text-[#182D4A]/50">
              {text}
            </span>
          </div>
        </div>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            highlight
              ? "bg-[#CC6B27]/10 text-[#CC6B27]"
              : "bg-white text-[#CC6B27]"
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  desc,
}) {
  return (
    <div className="rounded-lg border border-dashed border-[#071E3D]/15 bg-[#FAFAFA] px-5 py-12 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white text-[#071E3D]/25">
        {icon}
      </div>

      <h3 className="text-[14px] font-black text-[#071E3D]">
        {title}
      </h3>

      <p className="mx-auto mt-1 max-w-sm text-[11px] font-medium leading-5 text-[#182D4A]/55">
        {desc}
      </p>
    </div>
  );
}

export default VerifikasiTUK;