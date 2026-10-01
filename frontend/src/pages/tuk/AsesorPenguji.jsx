import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import SidebarTUK from "../../components/sidebar/SidebarTuk";
import { ArrowLeft, Award, BadgeCheck, Calendar, CalendarClock, ClipboardList, Hash, Inbox, Loader2, Phone, RefreshCcw, Search, ShieldCheck, ShieldX, UserPlus, Users, X } from "lucide-react";
import { notifikasi } from "../../components/ui/notifikasi";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const AsesorPenguji = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [jadwal, setJadwal] = useState(null);
  const [asesorJadwal, setAsesorJadwal] = useState([]);
  const [allAsesor, setAllAsesor] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [jumlahAsesi, setJumlahAsesi] = useState(0);
  const [minimalAsesor, setMinimalAsesor] = useState(1);

  const existingAsesorIds = useMemo(() => {
    return new Set(asesorJadwal.map((item) => Number(item.id_user)));
  }, [asesorJadwal]);

  const totalAsesorSetelahSimpan = useMemo(() => {
    return existingAsesorIds.size + selected.length;
  }, [existingAsesorIds, selected]);

  const kekuranganAsesor = useMemo(() => {
    return Math.max(
      0,
      minimalAsesor - totalAsesorSetelahSimpan
    );
  }, [
    minimalAsesor,
    totalAsesorSetelahSimpan
  ]);

  const filteredAsesor = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return allAsesor;
    }

    return allAsesor.filter((asesor) => {
      const nama = asesor?.nama_lengkap || asesor?.profileAsesor?.nama_lengkap || "";
      const register = asesor?.no_reg_asesor || asesor?.profileAsesor?.no_reg_asesor || "";
      const username = asesor?.user?.username || asesor?.username || "";
      const noHp = asesor?.user?.no_hp || asesor?.no_hp || "";

      return String(nama).toLowerCase().includes(keyword) ||
        String(register).toLowerCase().includes(keyword) ||
        String(username).toLowerCase().includes(keyword) ||
        String(noHp).toLowerCase().includes(keyword);
    });
  }, [allAsesor, search]);

  const fetchData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      const token = localStorage.getItem("token");

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
        resAllAsesor
      ] = await Promise.all([
        api.get(`/tuk/jadwal/${id}`),
        api.get(`/tuk/jadwal/${id}/asesor/asesor_penguji`),
        api.get(`/tuk/asesor?id_jadwal=${id}`)
      ]);

      setJadwal(
        resJadwal.data?.data || null
      );

      setAsesorJadwal(
        Array.isArray(
          resAsesorJadwal.data?.data
        )
          ? resAsesorJadwal.data.data
          : []
      );

      setAllAsesor(
        Array.isArray(
          resAllAsesor.data?.data
        )
          ? resAllAsesor.data.data
          : []
      );

      setJumlahAsesi(
        Number(
          resAllAsesor.data?.jumlah_asesi
        ) || 0
      );

      setMinimalAsesor(
        Number(
          resAllAsesor.data?.minimal_asesor_penguji
        ) || 1
      );
    } catch (err) {
      console.error(
        "Fetch Asesor Penguji Error:",
        err?.response?.data || err
      );

      const status =
        err?.response?.status;

      const message =
        err?.response?.data?.message ||
        "";

      if (status === 401) {
        await notifikasi.peringatan(
          "Sesi Berakhir",
          "Sesi login Anda telah berakhir. Silakan login kembali."
        );
        localStorage.clear();
        navigate("/login");
        return;
      }

      if (status === 404) {
        await notifikasi.peringatan(
          "Jadwal Tidak Ditemukan",
          "Jadwal yang Anda cari tidak ditemukan atau sudah tidak tersedia."
        );
        navigate("/tuk/jadwal");
        return;
      }

      await notifikasi.gagal(
        "Gagal Memuat Data",
        message ||
          "Data jadwal dan asesor gagal dimuat. Silakan coba lagi."
      );
    } finally {
      if (showLoading) {
        setLoading(false);
      }

      setRefreshing(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [fetchData, id]);

  const handleRefresh = async () => {
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
      "Data asesor penguji berhasil diperbarui."
    );
  };

  const handleAdd = useCallback(async (asesor) => {
    const idUser =
      Number(
        asesor.id_user
      );

    const nama =
      asesor?.nama_lengkap ||
      asesor?.profileAsesor?.nama_lengkap ||
      "Asesor ini";

    if (
      asesor.tersedia === false
    ) {
      const jadwalBentrok =
        asesor?.jadwal_bentrok;

      const namaJadwal =
        jadwalBentrok?.nama_kegiatan ||
        "jadwal lain";

      const tanggal =
        formatDate(
          jadwalBentrok?.tgl_awal
        );

      const jam =
        formatTime(
          jadwalBentrok?.jam
        );

      await notifikasi.peringatan(
        "Asesor Tidak Bisa Dipilih",
        `${nama} sudah memiliki jadwal "${namaJadwal}" pada ${tanggal}${jam !== "-" ? ` pukul ${jam}` : ""}. Pilih asesor lain.`
      );

      return;
    }

    const alreadySelected =
      selected.some(
        (item) =>
          Number(item) ===
          idUser
      );

    const alreadyAssigned =
      existingAsesorIds.has(
        idUser
      );

    if (
      alreadySelected ||
      alreadyAssigned
    ) {
      return;
    }

    setSelected(
      (prev) => [
        ...prev,
        idUser
      ]
    );
  }, [
    selected,
    existingAsesorIds
  ]);

  const handleRemoveSelected =
    useCallback(
      (idUser) => {
        setSelected(
          (prev) =>
            prev.filter(
              (item) =>
                Number(item) !==
                Number(idUser)
            )
        );
      },
      []
    );

  const handleCancelAllSelected =
    useCallback(
      async () => {
        if (
          selected.length ===
          0
        ) {
          return;
        }

        const confirmed =
          await notifikasi.konfirmasi(
            "Batalkan Pilihan?",
            `Semua ${selected.length} asesor yang belum disimpan akan dibatalkan.`,
            "Ya, Batalkan",
            "Kembali",
            "warning",
            "danger"
          );

        if (
          !confirmed.isConfirmed
        ) {
          return;
        }

        setSelected([]);

        await notifikasi.info(
          "Pilihan Dibatalkan",
          "Semua asesor yang belum disimpan sudah dibatalkan."
        );
      },
      [selected]
    );

  const handleSave =
    useCallback(
      async () => {
        if (
          selected.length ===
          0
        ) {
          await notifikasi.peringatan(
            "Asesor Belum Dipilih",
            "Pilih minimal satu asesor penguji terlebih dahulu."
          );
          return;
        }

        if (
          totalAsesorSetelahSimpan <
          minimalAsesor
        ) {
          await notifikasi.peringatan(
            "Asesor Masih Kurang",
            `Jadwal ini memiliki ${jumlahAsesi} asesi. Dibutuhkan minimal ${minimalAsesor} asesor penguji karena satu asesor maksimal menangani 10 asesi. Tambahkan ${kekuranganAsesor} asesor lagi.`
          );
          return;
        }

        try {
          setSaving(true);

          const payload = {
            listAsesor:
              selected.map(
                (idUser) => ({
                  id_user:
                    Number(
                      idUser
                    )
                })
              )
          };

          const res =
            await api.post(
              `/tuk/jadwal/${id}/asesor/asesor_penguji`,
              payload
            );

          setSelected([]);

          const jumlahBaru =
            Number(
              res.data?.baru
            ) || 0;

          const jumlahSudahAda =
            Number(
              res.data?.sudah_ada
            ) || 0;

          const total =
            Number(
              res.data?.total
            ) || totalAsesorSetelahSimpan;

          await notifikasi.sukses(
            "Berhasil Disimpan",
            jumlahBaru > 0
              ? `${jumlahBaru} asesor baru berhasil ditambahkan. Total asesor penguji sekarang ${total} orang.`
              : `${jumlahSudahAda} asesor sudah ada dan tidak dibuat ulang. Total asesor penguji sekarang ${total} orang.`
          );

          await fetchData(
            false
          );
        } catch (err) {
          console.error(
            "Save asesor error:",
            err?.response?.data ||
              err
          );

          const status =
            err?.response?.status;

          const responseData =
            err?.response?.data ||
            {};

          const message =
            responseData?.message ||
            "";

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
            responseData?.jumlah_asesi !==
              undefined &&
            responseData?.minimal_asesor !==
              undefined
          ) {
            const kurang =
              Number(
                responseData.kekurangan
              ) || 0;

            await notifikasi.peringatan(
              "Asesor Masih Kurang",
              `Jadwal ini memiliki ${responseData.jumlah_asesi} asesi. Minimal ${responseData.minimal_asesor} asesor penguji diperlukan. Tambahkan ${kurang} asesor lagi.`
            );

            await fetchData(
              false
            );

            return;
          }

          if (
            message.toLowerCase().includes(
              "jadwal lain"
            ) ||
            message.toLowerCase().includes(
              "hari dan jam yang sama"
            )
          ) {
            await notifikasi.peringatan(
              "Asesor Tidak Bisa Dipilih",
              "Asesor tersebut sudah memiliki jadwal lain pada hari dan jam yang sama."
            );

            await fetchData(
              false
            );

            return;
          }

          if (
            message.toLowerCase().includes(
              "dibuka"
            )
          ) {
            await notifikasi.peringatan(
              "Jadwal Belum Dibuka",
              "Asesor hanya bisa ditambahkan saat jadwal sudah dibuka."
            );
            return;
          }

          if (
            message.toLowerCase().includes(
              "duplicate"
            )
          ) {
            await notifikasi.peringatan(
              "Asesor Sudah Dipilih",
              "Ada asesor yang sama dipilih lebih dari satu kali."
            );
            return;
          }

          if (
            message.toLowerCase().includes(
              "tidak aktif"
            )
          ) {
            await notifikasi.gagal(
              "Asesor Tidak Dapat Dipilih",
              "Ada asesor yang sudah tidak aktif atau tidak tersedia."
            );

            await fetchData(
              false
            );

            return;
          }

          await notifikasi.gagal(
            "Gagal Menyimpan",
            message ||
              "Asesor penguji gagal disimpan. Silakan coba lagi."
          );
        } finally {
          setSaving(false);
        }
      },
      [
        id,
        selected,
        fetchData,
        navigate,
        totalAsesorSetelahSimpan,
        minimalAsesor,
        jumlahAsesi,
        kekuranganAsesor
      ]
    );

  const handleDeleteAsesor =
    useCallback(
      async (idUser) => {
        const asesor =
          asesorJadwal.find(
            (item) =>
              Number(
                item.id_user
              ) ===
              Number(idUser)
          );

        const namaAsesor =
          asesor?.profileAsesor
            ?.nama_lengkap ||
          asesor?.nama_lengkap ||
          "asesor ini";

        const confirmed =
          await notifikasi.konfirmasi(
            "Hapus Asesor?",
            `Yakin ingin menghapus ${namaAsesor} dari jadwal ini?`,
            "Ya, Hapus",
            "Batal",
            "warning",
            "danger"
          );

        if (
          !confirmed.isConfirmed
        ) {
          return;
        }

        try {
          await api.delete(
            `/tuk/jadwal/${id}/asesor/asesor_penguji/${idUser}`
          );

          await notifikasi.sukses(
            "Berhasil Dihapus",
            `${namaAsesor} berhasil dihapus dari jadwal.`
          );

          await fetchData(
            false
          );
        } catch (err) {
          console.error(
            "Delete asesor error:",
            err?.response?.data ||
              err
          );

          const message =
            err?.response?.data
              ?.message ||
            "";

          await notifikasi.gagal(
            "Gagal Menghapus",
            message ||
              "Asesor gagal dihapus dari jadwal."
          );
        }
      },
      [
        id,
        asesorJadwal,
        fetchData
      ]
    );

  const handleLogout =
    useCallback(
      () => {
        localStorage.clear();
        navigate("/login");
      },
      [navigate]
    );

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
            Memuat Data Asesor
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
            Jadwal yang Anda cari tidak ditemukan atau Anda tidak memiliki akses.
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
                    Asesor{" "}
                    <span className="text-[#CC6B27]">
                      Penguji
                    </span>
                  </h1>

                  <p className="mt-1 max-w-3xl text-[13px] font-medium leading-5 text-[#182D4A]/70">
                    Kelola asesor penguji yang ditugaskan pada jadwal{" "}
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

            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-4 md:p-6">
              <MiniStat
                icon={
                  <Users
                    size={22}
                  />
                }
                label="Jumlah Asesi"
                value={
                  jumlahAsesi
                }
              />

              <MiniStat
                icon={
                  <ShieldCheck
                    size={22}
                  />
                }
                label="Minimal Asesor"
                value={
                  `${minimalAsesor} orang`
                }
                tone="green"
              />

              <MiniStat
                icon={
                  <UserPlus
                    size={22}
                  />
                }
                label="Asesor Ditugaskan"
                value={
                  asesorJadwal.length
                }
              />

              <MiniStat
                icon={
                  <ClipboardList
                    size={22}
                  />
                }
                label="Asesor Tersedia"
                value={
                  allAsesor.filter(
                    (item) =>
                      item.tersedia !==
                      false
                  ).length
                }
                tone="blue"
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
                label="Tanggal"
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
                label="Jam"
                icon={
                  <CalendarClock
                    size={15}
                  />
                }
              >
                {formatTime(
                  jadwal?.jam
                )}
              </InfoBox>
            </div>

            <div className="border-t border-[#071E3D]/10 px-5 py-4 md:px-6">
              <div className="flex flex-col gap-2 rounded-lg border border-[#CC6B27]/20 bg-[#CC6B27]/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#CC6B27]">
                    Aturan Asesor Penguji
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-[#182D4A]/70">
                    1 asesor maksimal menangani 10 asesi.
                  </p>
                </div>

                <div className="text-[11px] font-black text-[#071E3D]">
                  {jumlahAsesi} asesi → minimal{" "}
                  {minimalAsesor} asesor
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
            <SectionHeader
              title="Tambah Asesor Penguji"
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
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#182D4A]/40"
                />

                <input
                  type="text"
                  value={
                    search
                  }
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
                      (
                        asesor
                      ) => {
                        const idUser =
                          Number(
                            asesor.id_user
                          );

                        const isAssigned =
                          existingAsesorIds.has(
                            idUser
                          );

                        const isSelected =
                          selected.some(
                            (item) =>
                              Number(
                                item
                              ) ===
                              idUser
                          );

                        const isConflict =
                          asesor.tersedia ===
                          false;

                        const nama =
                          asesor?.nama_lengkap ||
                          asesor?.profileAsesor?.nama_lengkap ||
                          "-";

                        const register =
                          asesor?.no_reg_asesor ||
                          asesor?.profileAsesor?.no_reg_asesor ||
                          "-";

                        const noHp =
                          asesor?.user?.no_hp ||
                          asesor?.no_hp ||
                          "-";

                        const username =
                          asesor?.user?.username ||
                          asesor?.username ||
                          "-";

                        const lisensi =
                          asesor?.no_lisensi ||
                          asesor?.profileAsesor?.no_lisensi ||
                          "-";

                        const bidangKeahlian =
                          asesor?.bidang_keahlian ||
                          asesor?.profileAsesor?.bidang_keahlian ||
                          "Asesor Penguji";

                        return (
                          <div
                            key={
                              asesor.id_user
                            }
                            className={`rounded-xl border p-4 transition-all ${
                              isConflict
                                ? "border-red-200 bg-red-50/40"
                                : isAssigned
                                ? "border-green-200 bg-green-50/40"
                                : isSelected
                                ? "border-[#CC6B27] bg-[#CC6B27]/5"
                                : "border-[#071E3D]/10 bg-white hover:border-[#CC6B27]/40 hover:bg-[#FAFAFA]"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                                  isConflict
                                    ? "bg-red-100 text-red-500"
                                    : isAssigned
                                    ? "bg-green-100 text-green-600"
                                    : isSelected
                                    ? "bg-[#CC6B27] text-white"
                                    : "bg-[#CC6B27]/10 text-[#CC6B27]"
                                }`}
                              >
                                {isConflict ? (
                                  <ShieldX
                                    size={18}
                                  />
                                ) : isAssigned ||
                                  isSelected ? (
                                  <BadgeCheck
                                    size={18}
                                  />
                                ) : (
                                  <UserPlus
                                    size={18}
                                  />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <h3
                                  className="truncate text-[14px] font-black text-[#071E3D]"
                                  title={
                                    nama
                                  }
                                >
                                  {
                                    nama
                                  }
                                </h3>

                                <p className="mt-1 line-clamp-2 min-h-[16px] text-[10px] font-medium leading-4 text-[#182D4A]/55">
                                  {
                                    bidangKeahlian
                                  }
                                </p>
                              </div>

                              {isConflict ? (
                                <span className="shrink-0 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-red-500">
                                  Jadwal Bentrok
                                </span>
                              ) : isAssigned ? (
                                <span className="shrink-0 rounded-lg border border-green-200 bg-green-50 px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-green-600">
                                  Aktif
                                </span>
                              ) : isSelected ? (
                                <span className="shrink-0 rounded-lg border border-[#CC6B27]/20 bg-[#CC6B27]/10 px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-[#CC6B27]">
                                  Dipilih
                                </span>
                              ) : null}
                            </div>

                            <div className="mt-4 space-y-2">
                              <MiniInfo
                                icon={
                                  <Hash
                                    size={13}
                                  />
                                }
                                label="Reg"
                                value={
                                  register
                                }
                              />

                              <MiniInfo
                                icon={
                                  <Phone
                                    size={13}
                                  />
                                }
                                label="HP"
                                value={
                                  noHp
                                }
                              />

                              <MiniInfo
                                icon={
                                  <Award
                                    size={13}
                                  />
                                }
                                label="Lisensi"
                                value={
                                  lisensi
                                }
                              />

                              <MiniInfo
                                icon={
                                  <Users
                                    size={13}
                                  />
                                }
                                label="Username"
                                value={
                                  username
                                }
                              />
                            </div>

                            {isConflict &&
                              asesor.jadwal_bentrok && (
                                <div className="mt-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5">
                                  <div className="flex items-start gap-2">
                                    <CalendarClock
                                      size={14}
                                      className="mt-0.5 shrink-0 text-red-500"
                                    />

                                    <div className="min-w-0">
                                      <p className="text-[9px] font-bold uppercase tracking-wider text-red-500">
                                        Sudah Ada Jadwal
                                      </p>

                                      <p className="mt-1 truncate text-[10px] font-bold text-red-700">
                                        {asesor.jadwal_bentrok.nama_kegiatan ||
                                          "Jadwal lain"}
                                      </p>

                                      <p className="mt-0.5 text-[9px] font-medium text-red-600">
                                        {formatDate(
                                          asesor.jadwal_bentrok.tgl_awal
                                        )}{" "}
                                        •{" "}
                                        {formatTime(
                                          asesor.jadwal_bentrok.jam
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                            <div className="mt-4">
                              {isAssigned ? (
                                <div className="flex w-full items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-[11px] font-bold text-green-600">
                                  <BadgeCheck
                                    size={15}
                                  />
                                  Sudah Ditugaskan
                                </div>
                              ) : isConflict ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleAdd(
                                      asesor
                                    )
                                  }
                                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-[11px] font-bold text-red-500 transition-all hover:border-red-500 hover:bg-red-500 hover:text-white"
                                >
                                  <ShieldX
                                    size={15}
                                  />
                                  Tidak Bisa Dipilih
                                </button>
                              ) : isSelected ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveSelected(
                                      idUser
                                    )
                                  }
                                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#CC6B27]/30 bg-white px-4 py-2.5 text-[11px] font-bold text-[#CC6B27] shadow-sm transition-all hover:border-red-500 hover:bg-red-500 hover:text-white"
                                >
                                  <X
                                    size={15}
                                  />
                                  Batal Memilih
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleAdd(
                                      asesor
                                    )
                                  }
                                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#CC6B27] px-4 py-2.5 text-[11px] font-bold text-white shadow-sm transition-all hover:bg-[#071E3D]"
                                >
                                  <UserPlus
                                    size={15}
                                  />
                                  Pilih Asesor
                                </button>
                              )}
                            </div>

                            {isAssigned && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteAsesor(
                                    idUser
                                  )
                                }
                                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-red-100 bg-white px-4 py-2.5 text-[11px] font-bold text-red-500 transition-all hover:border-red-500 hover:bg-red-500 hover:text-white"
                              >
                                <X
                                  size={15}
                                />
                                Hapus dari Jadwal
                              </button>
                            )}
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
                        Asesor Dipilih
                      </p>

                      <h3 className="mt-1 text-[18px] font-black text-white">
                        {selected.length} asesor baru
                      </h3>

                      <p className="mt-1 text-[11px] font-medium leading-5 text-white/55">
                        Total setelah disimpan:{" "}
                        <span className="font-bold text-white">
                          {totalAsesorSetelahSimpan} asesor
                        </span>
                        {" "}untuk{" "}
                        <span className="font-bold text-white">
                          {jumlahAsesi} asesi
                        </span>
                        .
                      </p>

                      {kekuranganAsesor >
                        0 ? (
                        <p className="mt-1 text-[11px] font-bold text-orange-300">
                          Masih kurang{" "}
                          {kekuranganAsesor} asesor.
                        </p>
                      ) : (
                        <p className="mt-1 text-[11px] font-bold text-green-300">
                          Jumlah asesor sudah memenuhi kebutuhan jadwal.
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={
                          handleCancelAllSelected
                        }
                        disabled={
                          saving
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-5 py-3 text-[11px] font-bold text-white transition-all hover:border-white hover:bg-white hover:text-[#071E3D] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <X
                          size={15}
                        />
                        Batal Memilih
                      </button>

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
                            size={15}
                            className="animate-spin"
                          />
                        ) : (
                          <UserPlus
                            size={15}
                          />
                        )}

                        {saving
                          ? "Menyimpan..."
                          : `Simpan ${selected.length} Asesor`}
                      </button>
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
  badge
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b-4 border-[#CC6B27] bg-[#071E3D] px-5 py-3.5">
      <h2 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-white">
        <span className="text-[#CC6B27]">
          {icon}
        </span>
        {title}
      </h2>

      {badge !==
        undefined && (
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
  children
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
  value
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
        {value ||
          "-"}
      </span>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
  tone = "orange"
}) {
  const tones = {
    orange:
      "bg-[#CC6B27]/10 text-[#CC6B27]",
    green:
      "bg-green-50 text-green-600",
    blue:
      "bg-blue-50 text-blue-600"
  };

  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#071E3D]/10 bg-white p-5 shadow-sm">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${
          tones[
            tone
          ] ||
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

function EmptyState({
  icon,
  title,
  desc
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

function formatDate(
  date
) {
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
      month:
        "long",
      year: "numeric"
    }
  );
}

function formatTime(
  time
) {
  if (!time) {
    return "-";
  }

  const value =
    String(time);

  return value.length >=
    5
    ? value.substring(
        0,
        5
      )
    : value;
}

export default AsesorPenguji;