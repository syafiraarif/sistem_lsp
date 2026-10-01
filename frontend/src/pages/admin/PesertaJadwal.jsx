import React, {
  useEffect,
  useState,
} from "react";
import {
  useParams,
  useNavigate,
} from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../services/api";
import {
  Search,
  ArrowLeft,
  Loader2,
  Eye,
  X,
  CalendarClock,
  Users,
  BadgeCheck,
  Award,
  Hash,
  Sparkles,
  FileText,
  UserPlus,
  RefreshCcw,
} from "lucide-react";

const PesertaJadwal = () => {
  const { id_jadwal } =
    useParams();

  const navigate =
    useNavigate();

  const [
    pesertaList,
    setPesertaList,
  ] = useState([]);

  const [
    listAsesor,
    setListAsesor,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    jadwalInfo,
    setJadwalInfo,
  ] = useState(null);

  const [
    showDetailModal,
    setShowDetailModal,
  ] = useState(false);

  const [
    selectedPeserta,
    setSelectedPeserta,
  ] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id_jadwal]);

  const fetchData =
    async () => {
      try {
        setLoading(true);

        const resPeserta =
          await api.get(
            `/admin/jadwal/${id_jadwal}/peserta`
          );

        const data =
          resPeserta.data?.data ||
          [];

        setPesertaList(data);

        if (
          data &&
          data.length > 0 &&
          data[0].jadwal
        ) {
          setJadwalInfo(
            data[0].jadwal
          );
        }

        const resAsesor =
          await api.get(
            `/admin/jadwal-asesor/${id_jadwal}`
          );

        let allAssignedAsesor =
          resAsesor.data?.data ||
          resAsesor.data ||
          [];

        if (
          !Array.isArray(
            allAssignedAsesor
          ) &&
          allAssignedAsesor.rows
        ) {
          allAssignedAsesor =
            allAssignedAsesor.rows;
        }

        const asesorPenguji =
          allAssignedAsesor.filter(
            (a) =>
              a.jenis_tugas ===
                "asesor_penguji" &&
              a.status ===
                "aktif"
          );

        setListAsesor(
          asesorPenguji
        );
      } catch (
        error
      ) {
        console.error(
          "Gagal mengambil data:",
          error
        );

        Swal.fire(
          "Gagal",
          error?.response?.data
            ?.message ||
            "Gagal mengambil data peserta.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

  const handleAssignAsesor =
    async (
      id_peserta,
      id_asesor
    ) => {
      try {
        Swal.fire({
          title:
            "Menyimpan...",
          allowOutsideClick: false,
          didOpen: () =>
            Swal.showLoading(),
        });

        await api.put(
          `/admin/peserta-jadwal/${id_peserta}/assign-asesor`,
          {
            id_asesor:
              id_asesor || null,
          }
        );

        Swal.fire(
          "Berhasil",
          "Asesor penguji berhasil ditugaskan",
          "success"
        );

        setPesertaList(
          (prev) =>
            prev.map(
              (p) => {
                if (
                  p.id_peserta ===
                  id_peserta
                ) {
                  return {
                    ...p,
                    id_asesor:
                      id_asesor ||
                      null,
                  };
                }

                return p;
              }
            )
        );
      } catch (
        error
      ) {
        console.error(
          error
        );

        Swal.fire(
          "Gagal",
          "Terjadi kesalahan saat menyimpan",
          "error"
        );
      }
    };

  const getAsesiName =
    (userObj) => {
      if (!userObj) {
        return "-";
      }

      const profile =
        userObj.ProfileAsesi ||
        userObj.profileAsesi ||
        userObj.profile_asesi;

      return (
        profile?.nama_lengkap ||
        userObj.username ||
        "-"
      );
    };

  const getAsesiNik =
    (userObj) => {
      if (!userObj) {
        return "-";
      }

      const profile =
        userObj.ProfileAsesi ||
        userObj.profileAsesi ||
        userObj.profile_asesi;

      return (
        profile?.nik ||
        "-"
      );
    };

  const getSkemaName =
    (jadwalObj) => {
      const targetJadwal =
        jadwalObj ||
        jadwalInfo;

      if (
        !targetJadwal
      ) {
        return "-";
      }

      return (
        targetJadwal.skema
          ?.judul_skema ||
        targetJadwal.Skema
          ?.judul_skema ||
        "-"
      );
    };

  const getDropdownAsesorName =
    (itemJadwalAsesor) => {
      if (
        !itemJadwalAsesor
      ) {
        return "Tanpa Nama";
      }

      const user =
        itemJadwalAsesor.asesor ||
        {};

      const profile =
        itemJadwalAsesor.profileAsesor ||
        itemJadwalAsesor.ProfileAsesor ||
        {};

      if (
        profile.nama_lengkap
      ) {
        return profile.nama_lengkap;
      }

      if (
        user.nama
      ) {
        return user.nama;
      }

      if (
        user.username &&
        !/^\d+$/.test(
          user.username
        )
      ) {
        return user.username;
      }

      return user.username
        ? `Asesor (${user.username})`
        : "Tanpa Nama";
    };

  const getAssignedAsesorName =
    (userPenguji) => {
      if (
        !userPenguji
      ) {
        return "Pilih Asesor Penguji";
      }

      const profile =
        userPenguji.ProfileAsesor ||
        userPenguji.profile_asesor ||
        {};

      if (
        profile.nama_lengkap
      ) {
        return profile.nama_lengkap;
      }

      if (
        userPenguji.nama
      ) {
        return userPenguji.nama;
      }

      if (
        userPenguji.username &&
        !/^\d+$/.test(
          userPenguji.username
        )
      ) {
        return userPenguji.username;
      }

      return userPenguji.username
        ? `Asesor (${userPenguji.username})`
        : "Tanpa Nama";
    };

  const getStatusKompetensi =
    (item) => {
      const status =
        String(
          item?.status_asesmen ||
            ""
        )
          .toLowerCase()
          .trim()
          .replace(
            /\s+/g,
            "_"
          );

      if (
        status ===
          "kompeten" ||
        status === "k"
      ) {
        return "K";
      }

      if (
        status ===
          "belum_kompeten" ||
        status ===
          "belum_kompeten" ||
        status === "bk"
      ) {
        return "BK";
      }

      return "-";
    };

  const getStatusClass =
    (item) => {
      const status =
        getStatusKompetensi(
          item
        );

      if (
        status ===
        "K"
      ) {
        return "bg-green-50 text-green-600 border-green-200";
      }

      if (
        status ===
        "BK"
      ) {
        return "bg-red-50 text-red-600 border-red-200";
      }

      return "bg-blue-50 text-blue-600 border-blue-200";
    };

  const filteredData =
    pesertaList.filter(
      (item) => {
        const nama =
          getAsesiName(
            item.user
          ).toLowerCase();

        const nik =
          getAsesiNik(
            item.user
          ).toLowerCase();

        const term =
          searchTerm
            .toLowerCase()
            .trim();

        return (
          nama.includes(term) ||
          nik.includes(term)
        );
      }
    );

  const totalKompeten =
    pesertaList.filter(
      (item) =>
        getStatusKompetensi(
          item
        ) === "K"
    ).length;

  const totalBelumKompeten =
    pesertaList.filter(
      (item) =>
        getStatusKompetensi(
          item
        ) === "BK"
    ).length;

  const totalProses =
    pesertaList.filter(
      (item) =>
        getStatusKompetensi(
          item
        ) === "-"
    ).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <Loader2
            className="mx-auto mb-4 animate-spin text-[#CC6B27]"
            size={42}
          />

          <p className="text-[13px] font-bold text-[#071E3D]">
            Memuat data peserta jadwal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 md:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="relative overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white p-6 shadow-sm">
          <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/2 rounded-full bg-[#CC6B27]/10 blur-3xl" />

          <div className="relative z-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="m-0 mb-1 text-[24px] font-black text-[#071E3D] md:text-[28px]">
                {jadwalInfo
                  ? jadwalInfo.nama_kegiatan
                  : "Data Peserta & Penugasan"}
              </h2>

              <p className="m-0 max-w-2xl text-[14px] font-medium text-[#182D4A]/70">
                {jadwalInfo
                  ? `Skema: ${getSkemaName(
                      jadwalInfo
                    )}`
                  : "Mengelola asesi dan menentukan asesor pengujinya."}
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
              <button
                type="button"
                onClick={
                  fetchData
                }
                disabled={
                  loading
                }
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-[#071E3D]/20 bg-white px-4 py-2.5 text-[13px] font-bold text-[#071E3D] shadow-sm transition-all hover:bg-[#071E3D]/5 disabled:opacity-50 md:flex-none"
              >
                {loading ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <RefreshCcw
                    size={16}
                  />
                )}

                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          <StatCard
            icon={
              <Users
                size={22}
              />
            }
            label="Total Peserta"
            value={`${pesertaList.length} Orang`}
            tone="navy"
          />

          <StatCard
            icon={
              <CalendarClock
                size={22}
              />
            }
            label="Proses"
            value={`${totalProses} Data`}
            tone="blue"
          />

          <StatCard
            icon={
              <BadgeCheck
                size={22}
              />
            }
            label="Kompeten"
            value={`${totalKompeten} Lulus`}
            tone="green"
          />

          <StatCard
            icon={
              <Award
                size={22}
              />
            }
            label="Belum Kompeten"
            value={`${totalBelumKompeten} Gagal`}
            tone="red"
          />
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-[#071E3D]/10 bg-white p-6 shadow-sm">
          <div className="mb-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="m-0 flex items-center gap-2 text-[16px] font-bold text-[#071E3D]">
                <FileText
                  size={18}
                  className="text-[#CC6B27]"
                />
                Daftar Peserta & Penugasan
              </h4>
            </div>

            <div className="group relative w-full sm:max-w-xs">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/50 transition-colors group-focus-within:text-[#CC6B27]"
              />

              <input
                type="text"
                placeholder="Cari nama atau NIK..."
                value={
                  searchTerm
                }
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
                className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] py-2.5 pl-10 pr-4 text-[13px] font-semibold text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
            <table className="w-full min-w-[1000px] border-collapse bg-white text-left">
              <thead>
                <tr>
                  <TableHead center>
                    No
                  </TableHead>

                  <TableHead>
                    Asesi (Peserta)
                  </TableHead>

                  <TableHead>
                    <div className="flex items-center gap-2">
                      <UserPlus
                        size={14}
                        className="text-[#CC6B27]"
                      />

                      Asesor Penguji
                    </div>
                  </TableHead>

                  <TableHead center>
                    Status
                  </TableHead>

                  <TableHead center>
                    Aksi
                  </TableHead>
                </tr>
              </thead>

              <tbody>
                {filteredData.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-16 text-center"
                    >
                      <Users
                        size={48}
                        className="mx-auto mb-3 text-[#071E3D]/20"
                      />

                      <p className="text-[14px] font-medium text-[#182D4A]">
                        Belum ada peserta yang terdaftar atau cocok dengan pencarian.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredData.map(
                    (
                      row,
                      index
                    ) => {
                      const asesiName =
                        getAsesiName(
                          row.user
                        );

                      const asesiNik =
                        getAsesiNik(
                          row.user
                        );

                      const status =
                        getStatusKompetensi(
                          row
                        );

                      return (
                        <tr
                          key={
                            row.id_peserta
                          }
                          className="border-b border-[#071E3D]/5 transition-colors hover:bg-[#CC6B27]/5"
                        >
                          <td className="px-5 py-4 text-center text-[13.5px] font-semibold text-[#071E3D]">
                            {index +
                              1}
                          </td>

                          <td className="px-5 py-4">
                            <div className="text-[13.5px] font-bold text-[#071E3D]">
                              {
                                asesiName
                              }
                            </div>

                            <div className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                              <Hash
                                size={12}
                              />

                              NIK:{" "}
                              {
                                asesiNik
                              }
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            {listAsesor.length ===
                            0 ? (
                              <span className="text-[11px] font-semibold italic text-red-500">
                                *Belum ada Asesor Penguji
                              </span>
                            ) : (
                              <select
                                value={
                                  row.id_asesor ||
                                  ""
                                }
                                onChange={(
                                  e
                                ) =>
                                  handleAssignAsesor(
                                    row.id_peserta,
                                    e
                                      .target
                                      .value
                                  )
                                }
                                className={`w-full max-w-[220px] cursor-pointer appearance-none rounded-lg border px-3 py-2 text-[12px] font-semibold outline-none transition-all focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 ${
                                  row.id_asesor
                                    ? "border-[#CC6B27]/30 bg-orange-50 text-[#CC6B27]"
                                    : "border-[#071E3D]/20 bg-[#FAFAFA] text-[#071E3D]"
                                }`}
                              >
                                <option value="">
                                  -- Pilih Asesor --
                                </option>

                                {listAsesor.map(
                                  (a) => {
                                    const asId =
                                      a.asesor
                                        ?.id_user;

                                    if (
                                      !asId
                                    ) {
                                      return null;
                                    }

                                    return (
                                      <option
                                        key={
                                          asId
                                        }
                                        value={
                                          asId
                                        }
                                      >
                                        {
                                          getDropdownAsesorName(
                                            a
                                          )
                                        }
                                      </option>
                                    );
                                  }
                                )}
                              </select>
                            )}
                          </td>

                          <td className="px-5 py-4 text-center">
                            <span
                              className={`inline-flex min-w-[48px] justify-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${getStatusClass(
                                row
                              )}`}
                            >
                              {
                                status
                              }
                            </span>
                          </td>

                          <td className="px-5 py-4 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPeserta(
                                  row
                                );

                                setShowDetailModal(
                                  true
                                );
                              }}
                              className="inline-flex items-center justify-center rounded-lg bg-[#182D4A]/10 p-1.5 text-[#182D4A] transition-colors hover:bg-[#182D4A] hover:text-white"
                              title="Lihat Detail"
                            >
                              <Eye
                                size={16}
                              />
                            </button>
                          </td>
                        </tr>
                      );
                    }
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showDetailModal &&
        selectedPeserta && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/40 p-4 backdrop-blur-sm">
            <div className="flex max-h-[95vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#071E3D]/10 bg-[#FAFAFA] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[#CC6B27]/10 p-2 text-[#CC6B27]">
                    <UserPlus
                      size={20}
                    />
                  </div>

                  <div>
                    <h3 className="m-0 text-[16px] font-bold text-[#071E3D]">
                      Detail Asesi
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  className="rounded-lg p-1.5 text-[#182D4A] transition-colors hover:bg-red-50 hover:text-red-500"
                  onClick={() =>
                    setShowDetailModal(
                      false
                    )
                  }
                >
                  <X size={20} />
                </button>
              </div>

              <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto bg-white p-6">
                <div className="rounded-lg border border-[#071E3D]/10 bg-[#FAFAFA] p-4">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Nama Lengkap Asesi
                  </p>

                  <p className="text-[13.5px] font-bold text-[#071E3D]">
                    {getAsesiName(
                      selectedPeserta.user
                    )}
                  </p>
                </div>

                <div className="rounded-lg border border-[#CC6B27]/20 bg-orange-50 p-4">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#CC6B27]">
                    Asesor Penguji
                  </p>

                  <p className="text-[13.5px] font-bold text-[#CC6B27]">
                    {getAssignedAsesorName(
                      selectedPeserta.asesor_penguji
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-[#071E3D]/10 bg-[#FAFAFA] p-4">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      NIK
                    </p>

                    <p className="text-[13px] font-bold text-[#071E3D]">
                      {getAsesiNik(
                        selectedPeserta.user
                      )}
                    </p>
                  </div>

                  <div className="rounded-lg border border-[#071E3D]/10 bg-[#FAFAFA] p-4">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Status
                    </p>

                    <span
                      className={`inline-flex min-w-[48px] justify-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${getStatusClass(
                        selectedPeserta
                      )}`}
                    >
                      {getStatusKompetensi(
                        selectedPeserta
                      )}
                    </span>
                  </div>
                </div>

                {selectedPeserta.keterangan && (
                  <div className="rounded-lg border border-[#071E3D]/10 bg-[#FAFAFA] p-4">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Catatan / Keterangan
                    </p>

                    <p className="text-[13px] font-medium leading-relaxed text-[#071E3D]">
                      {
                        selectedPeserta.keterangan
                      }
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 border-t border-[#071E3D]/10 bg-[#FAFAFA] px-6 py-4">
                <button
                  type="button"
                  className="rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-5 py-2.5 text-[13px] font-bold text-[#182D4A] transition-all hover:bg-[#E2E8F0]"
                  onClick={() =>
                    setShowDetailModal(
                      false
                    )
                  }
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #CC6B27;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8561f;
        }
      `,
        }}
      />
    </div>
  );
};

const StatCard = ({
  label,
  value,
  icon,
  tone = "orange",
}) => {
  const tones = {
    navy:
      "bg-[#071E3D]/10 text-[#071E3D]",
    orange:
      "bg-[#CC6B27]/10 text-[#CC6B27]",
    green:
      "bg-green-50 text-green-600",
    red:
      "bg-red-50 text-red-500",
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

      <div className="overflow-hidden">
        <p className="truncate text-[11px] font-bold uppercase tracking-widest text-[#182D4A]/60">
          {label}
        </p>

        <p className="mt-1 truncate text-[20px] font-black leading-none text-[#071E3D]">
          {value}
        </p>
      </div>
    </div>
  );
};

function TableHead({
  children,
  center,
}) {
  return (
    <th
      className={`border-b-4 border-[#CC6B27] bg-[#071E3D] px-5 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA] ${
        center
          ? "text-center"
          : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

export default PesertaJadwal;