import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import SidebarAsesor from "../../components/sidebar/SidebarAsesor";
import {
  CalendarCheck,
  CheckCircle2,
  Clock3,
  FileSignature,
  Loader2,
  MapPin,
  RefreshCcw,
  ShieldCheck,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";
import { notifikasi } from "../../components/ui/notifikasi";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default function PresensiAsesor() {
  const { id_jadwal } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [presensi, setPresensi] = useState(null);
  const [profile, setProfile] = useState(null);
  const [jadwal, setJadwal] = useState(null);

  const [peserta, setPeserta] = useState([]);
  const [jumlahPeserta, setJumlahPeserta] = useState(0);

  const [error, setError] = useState("");

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const getCurrentUser = () => {
    try {
      const userData = localStorage.getItem("user");

      if (!userData) {
        return null;
      }

      return JSON.parse(userData);
    } catch (error) {
      console.error(
        "Gagal membaca user dari localStorage:",
        error
      );

      return null;
    }
  };

  const getCurrentUserId = () => {
    const user = getCurrentUser();

    if (!user) {
      return null;
    }

    const id =
      user.id_user ??
      user.id ??
      user.user?.id_user ??
      user.user?.id;

    return id ? Number(id) : null;
  };

  const getImageSrc = (filePath) => {
    if (!filePath) {
      return "";
    }

    const cleanPath = String(filePath).replace(
      /\\/g,
      "/"
    );

    if (
      cleanPath.startsWith("http://") ||
      cleanPath.startsWith("https://")
    ) {
      return cleanPath;
    }

    const base = API_BASE.replace(
      /\/api\/?$/,
      ""
    );

    return `${base}/${cleanPath.replace(/^\/+/, "")}`;
  };

  const getProfile = async () => {
    const response = await api.get(
      "/asesor/profile"
    );

    return (
      response.data?.data ||
      response.data ||
      null
    );
  };

  const getPresensi = async () => {
    try {
      const response = await api.get(
        `/asesor/presensi/${id_jadwal}`
      );

      return response.data?.data || null;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }

      throw error;
    }
  };

  const getJadwal = async () => {
    const response = await api.get(
      "/asesor/jadwal-saya"
    );

    const responseData =
      response.data?.data ||
      response.data ||
      [];

    const list = Array.isArray(responseData)
      ? responseData
      : responseData?.data || [];

    const found = list.find(
      (item) =>
        Number(
          item?.id_jadwal ??
            item?.jadwal?.id_jadwal ??
            item?.jadwal?.id ??
            item?.id
        ) === Number(id_jadwal)
    );

    if (!found) {
      return null;
    }

    return found.jadwal || found;
  };

  const getPeserta = async () => {
    const response = await api.get(
      `/asesor/jadwal/${id_jadwal}/peserta`
    );

    const data =
      response.data?.data ||
      response.data ||
      [];

    const list = Array.isArray(data)
      ? data
      : [];

    return {
      all: list,
      milikAsesor: list,
    };
  };

  const loadData = async (
    showSuccess = false
  ) => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const [
        profileResult,
        presensiResult,
        jadwalResult,
        pesertaResult,
      ] = await Promise.allSettled([
        getProfile(),
        getPresensi(),
        getJadwal(),
        getPeserta(),
      ]);

      let failedCount = 0;

      if (
        profileResult.status ===
        "fulfilled"
      ) {
        setProfile(
          profileResult.value
        );
      } else {
        failedCount += 1;
        setProfile(null);
        console.error(
          "PROFILE ERROR:",
          profileResult.reason
        );
      }

      if (
        presensiResult.status ===
        "fulfilled"
      ) {
        setPresensi(
          presensiResult.value
        );
      } else {
        setPresensi(null);
        console.error(
          "PRESENSI ERROR:",
          presensiResult.reason
        );
      }

      if (
        jadwalResult.status ===
        "fulfilled"
      ) {
        setJadwal(
          jadwalResult.value
        );

        if (!jadwalResult.value) {
          failedCount += 1;
          setError(
            "Data jadwal asesor tidak ditemukan."
          );
        }
      } else {
        failedCount += 1;
        setJadwal(null);

        console.error(
          "JADWAL ERROR:",
          jadwalResult.reason
        );
      }

      if (
        pesertaResult.status ===
        "fulfilled"
      ) {
        const result =
          pesertaResult.value || {};

        const semuaPeserta =
          result.all || [];

        const pesertaMilikAsesor =
          result.milikAsesor || [];

        setPeserta(
          pesertaMilikAsesor
        );

        setJumlahPeserta(
          pesertaMilikAsesor.length
        );

        console.log(
          "Semua peserta:",
          semuaPeserta
        );

        console.log(
          "Peserta milik asesor:",
          pesertaMilikAsesor
        );
      } else {
        failedCount += 1;
        setPeserta([]);
        setJumlahPeserta(0);

        console.error(
          "PESERTA ERROR:",
          pesertaResult.reason
        );
      }

      if (showSuccess) {
        if (failedCount === 0) {
          await notifikasi.sukses(
            "Berhasil",
            "Data presensi asesor berhasil diperbarui."
          );
        } else {
          await notifikasi.peringatan(
            "Data Tidak Lengkap",
            `${failedCount} data gagal dimuat. Silakan coba Refresh kembali.`
          );
        }
      } else if (failedCount > 0) {
        await notifikasi.peringatan(
          "Data Tidak Lengkap",
          "Sebagian data presensi asesor tidak dapat dimuat."
        );
      }
    } catch (error) {
      console.error(
        "LOAD PRESENSI ERROR:",
        error
      );

      const message =
        error.response?.data?.message ||
        error.message ||
        "Data presensi tidak dapat dimuat.";

      setError(message);

      await notifikasi.gagal(
        "Gagal Memuat Data",
        message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id_jadwal) {
      loadData(false);
    }
  }, [id_jadwal]);

  const handlePresensi = async () => {
    try {
      const ttdPath =
        profile?.ttd_path;

      if (!ttdPath) {
        await notifikasi.peringatan(
          "Tanda Tangan Belum Ada",
          "Silakan lengkapi tanda tangan pada profile asesor terlebih dahulu."
        );

        return;
      }

      if (jumlahPeserta <= 0) {
        await notifikasi.peringatan(
          "Belum Ada Peserta",
          "Belum ada peserta yang ditugaskan kepada Anda pada jadwal ini."
        );

        return;
      }

      const confirm =
        await Swal.fire({
          icon: "question",
          title: "Presensi Skema",
          html: `
            <div style="font-size:14px; line-height:1.7; text-align:left;">
              <p style="margin-bottom:8px;">
                Kamu akan melakukan presensi sebagai
                <b>Asesor Penguji</b>.
              </p>

              <p style="margin-bottom:5px;">
                <b>Skema:</b> ${namaSkema}
              </p>

              <p style="margin-bottom:5px;">
                <b>Tanggal:</b> ${tanggal}
              </p>

              <p style="margin-bottom:0;">
                <b>Peserta:</b> ${jumlahPeserta} peserta
              </p>
            </div>
          `,
          showCancelButton: true,
          confirmButtonText:
            "Ya, Presensi",
          cancelButtonText: "Batal",
          confirmButtonColor:
            "#CC6B27",
          cancelButtonColor:
            "#64748B",
          reverseButtons: true,
        });

      if (!confirm.isConfirmed) {
        return;
      }

      setSubmitting(true);

      const response =
        await api.post(
          "/asesor/presensi",
          {
            id_jadwal:
              Number(id_jadwal),
            ttd_path: ttdPath,
          }
        );

      if (response.data?.success) {
        await loadData(false);

        await notifikasi.sukses(
          "Presensi Berhasil",
          response.data?.message ||
            "Presensi kamu berhasil disimpan."
        );
      } else {
        throw new Error(
          response.data?.message ||
            "Presensi gagal."
        );
      }
    } catch (error) {
      console.error(
        "PRESENSI ERROR:",
        error
      );

      const message =
        error.response?.data?.message ||
        error.message ||
        "Presensi tidak dapat disimpan.";

      await notifikasi.gagal(
        "Presensi Gagal",
        message
      );
    } finally {
      setSubmitting(false);
    }
  };

  const namaAsesor =
    profile?.nama_lengkap ||
    profile?.nama ||
    "-";

  const ttdUrl =
    getImageSrc(
      profile?.ttd_path
    );

  const namaSkema =
    jadwal?.skema?.judul_skema ||
    jadwal?.skema?.nama_skema ||
    jadwal?.judul_skema ||
    jadwal?.nama_skema ||
    "-";

  const kodeSkema =
    jadwal?.skema?.kode_skema ||
    jadwal?.kode_skema ||
    "-";

  const namaTuk =
    jadwal?.tuk?.nama_tuk ||
    jadwal?.nama_tuk ||
    jadwal?.tempat ||
    "-";

  const tanggal =
    jadwal?.tgl_awal &&
    jadwal?.tgl_akhir
      ? `${formatTanggalSingkat(
          jadwal.tgl_awal
        )} s/d ${formatTanggalSingkat(
          jadwal.tgl_akhir
        )}`
      : formatTanggalSingkat(
          jadwal?.tgl_awal ||
            jadwal?.tgl_akhir
        );

  const sudahPresensi =
    Boolean(
      presensi?.id_presensi ||
        presensi
    );

  const goBack = () => {
    navigate("/asesor/jadwal-saya");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <SidebarAsesor
          isOpen={false}
          setIsOpen={() => {}}
        />

        <main className="flex min-h-screen items-center justify-center p-6">
          <div className="w-full max-w-md overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
            <div className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-6 py-4">
              <div className="flex items-center gap-3">
                <Loader2
                  size={18}
                  className="animate-spin text-[#CC6B27]"
                />

                <h2 className="text-[13px] font-bold uppercase tracking-wider text-white">
                  Memuat Presensi
                </h2>
              </div>
            </div>

            <div className="p-8 text-center">
              <p className="text-[13px] font-medium text-[#182D4A]/70">
                Sedang mengambil data jadwal, profile, dan peserta asesor.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error && !jadwal) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex">
        <SidebarAsesor
          isOpen={false}
          setIsOpen={() => {}}
        />

        <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">
          <div className="mx-auto flex min-h-[70vh] w-full max-w-[1500px] items-center justify-center">
            <div className="w-full max-w-md overflow-hidden rounded-xl border border-red-100 bg-white shadow-sm">
              <div className="border-b-4 border-red-400 bg-[#071E3D] px-6 py-4">
                <div className="flex items-center gap-3">
                  <XCircle
                    size={19}
                    className="text-red-400"
                  />

                  <h2 className="text-[13px] font-bold uppercase tracking-wider text-white">
                    Data Presensi Tidak Tersedia
                  </h2>
                </div>
              </div>

              <div className="p-8 text-center">
                <p className="text-[13px] font-medium leading-relaxed text-[#182D4A]/70">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={goBack}
                  className="mt-6 rounded-lg border border-[#CC6B27] bg-[#CC6B27] px-5 py-2.5 text-[12px] font-bold text-white transition-all hover:border-[#A8561F] hover:bg-[#A8561F]"
                >
                  Kembali ke Jadwal
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <SidebarAsesor
        isOpen={false}
        setIsOpen={() => {}}
      />

      <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-[1500px] space-y-5">
          <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
            <div className="border-b border-[#071E3D]/10 px-5 py-5 md:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-[24px] font-black text-[#071E3D] md:text-[28px]">
                    Presensi Skema
                  </h1>

                  <p className="mt-1 text-[13px] font-medium leading-relaxed text-[#182D4A]/70">
                    Lakukan presensi sebagai asesor penguji untuk jadwal uji kompetensi yang ditugaskan.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    loadData(true)
                  }
                  disabled={loading}
                  className="rounded-lg border border-[#071E3D]/20 bg-white px-4 py-2.5 text-[12px] font-bold text-[#071E3D] shadow-sm transition-all hover:border-[#071E3D] hover:bg-[#071E3D] hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading ? (
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />
                    ) : (
                      <RefreshCcw size={15} />
                    )}

                    Refresh
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3 md:p-6">
              <MiniStat
                icon={
                  <CalendarCheck
                    size={21}
                  />
                }
                label="Status Presensi"
                value={
                  sudahPresensi
                    ? "Sudah Presensi"
                    : "Belum Presensi"
                }
                tone={
                  sudahPresensi
                    ? "green"
                    : "orange"
                }
              />

              <MiniStat
                icon={
                  <Users size={21} />
                }
                label="Peserta"
                value={`${jumlahPeserta} Peserta`}
                tone="orange"
              />

              <MiniStat
                icon={
                  <ShieldCheck
                    size={21}
                  />
                }
                label="Asesor"
                value="Asesor Penguji"
                tone="orange"
              />
            </div>
          </section>

          <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
              <SectionHeader
                icon={
                  <CalendarCheck
                    size={17}
                  />
                }
                title="Informasi Jadwal"
                subtitle="Detail jadwal uji kompetensi."
              />

              <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2 md:p-6">
                <InfoCard
                  icon={
                    <ShieldCheck
                      size={17}
                    />
                  }
                  label="Skema Sertifikasi"
                  value={namaSkema}
                />

                <InfoCard
                  icon={
                    <FileSignature
                      size={17}
                    />
                  }
                  label="Kode Skema"
                  value={kodeSkema}
                />

                <InfoCard
                  icon={
                    <MapPin size={17} />
                  }
                  label="TUK"
                  value={namaTuk}
                />

                <InfoCard
                  icon={
                    <Clock3 size={17} />
                  }
                  label="Tanggal"
                  value={tanggal}
                />

                <div className="md:col-span-2">
                  <InfoCard
                    icon={
                      <UserRound
                        size={17}
                      />
                    }
                    label="Asesor Penguji"
                    value={namaAsesor}
                  />
                </div>

                <div className="md:col-span-2">
                  <InfoCard
                    icon={
                      <Users size={17} />
                    }
                    label="Peserta"
                    value={`${jumlahPeserta} peserta`}
                    description={
                      jumlahPeserta > 0
                        ? "Peserta yang ditugaskan kepada Anda pada jadwal ini."
                        : "Belum ada peserta yang ditugaskan kepada Anda."
                    }
                  />
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
              <SectionHeader
                icon={
                  <FileSignature
                    size={17}
                  />
                }
                title="Presensi Asesor"
                subtitle="Presensi menggunakan tanda tangan dari profile asesor."
              />

              <div className="p-5 md:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
                    <FileSignature
                      size={19}
                    />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#182D4A]/50">
                      Tanda Tangan Digital
                    </p>

                    <p className="mt-0.5 text-[13px] font-bold text-[#071E3D]">
                      Tanda Tangan Asesor
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex h-44 items-center justify-center overflow-hidden rounded-lg border border-dashed border-[#071E3D]/15 bg-[#FAFAFA]">
                  {ttdUrl ? (
                    <img
                      src={ttdUrl}
                      alt="Tanda tangan asesor"
                      className="max-h-36 max-w-[85%] object-contain"
                    />
                  ) : (
                    <div className="px-6 text-center">
                      <FileSignature
                        className="mx-auto mb-3 text-[#071E3D]/20"
                        size={36}
                      />

                      <p className="text-[13px] font-bold text-[#071E3D]">
                        Tanda tangan belum tersedia
                      </p>

                      <p className="mt-1 text-[11px] font-medium text-[#182D4A]/60">
                        Lengkapi tanda tangan melalui profile asesor.
                      </p>
                    </div>
                  )}
                </div>

                {sudahPresensi ? (
                  <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2
                        size={20}
                        className="mt-0.5 shrink-0 text-green-600"
                      />

                      <div>
                        <p className="text-[12px] font-bold text-green-700">
                          Sudah Presensi
                        </p>

                        <p className="mt-1 text-[11px] font-medium leading-relaxed text-green-600">
                          Anda sudah melakukan presensi untuk jadwal skema ini.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {jumlahPeserta > 0 ? (
                      <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4">
                        <div className="flex items-start gap-3">
                          <Users
                            size={18}
                            className="mt-0.5 shrink-0 text-green-600"
                          />

                          <div>
                            <p className="text-[12px] font-bold text-green-700">
                              {jumlahPeserta} Peserta Terdaftar
                            </p>

                            <p className="mt-1 text-[11px] font-medium leading-relaxed text-green-600">
                              Peserta telah ditugaskan kepada Anda pada jadwal ini.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <div className="flex items-start gap-3">
                          <Users
                            size={18}
                            className="mt-0.5 shrink-0 text-amber-600"
                          />

                          <div>
                            <p className="text-[12px] font-bold text-amber-700">
                              Belum Ada Peserta
                            </p>

                            <p className="mt-1 text-[11px] font-medium leading-relaxed text-amber-600">
                              Presensi belum dapat dilakukan karena belum ada peserta yang ditugaskan.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={
                        handlePresensi
                      }
                      disabled={
                        submitting ||
                        !ttdUrl ||
                        jumlahPeserta <= 0
                      }
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-[#CC6B27] bg-[#CC6B27] px-5 py-3 text-[12px] font-bold text-white shadow-sm transition-all hover:border-[#A8561F] hover:bg-[#A8561F] disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300"
                    >
                      {submitting ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <CheckCircle2
                          size={16}
                        />
                      )}

                      {submitting
                        ? "Menyimpan Presensi..."
                        : "Presensi Skema Ini"}
                    </button>
                  </>
                )}
              </div>
            </section>
          </section>

          <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
            <SectionHeader
              icon={<Users size={17} />}
              title="Ringkasan Peserta"
              subtitle="Informasi peserta yang menjadi tanggung jawab asesor pada jadwal ini."
            />

            <div className="p-5 md:p-6">
              {jumlahPeserta > 0 ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {peserta.map(
                    (item, index) => {
                      const namaPeserta =
                        item?.nama_lengkap ||
                        item?.nama ||
                        item?.user?.nama_lengkap ||
                        item?.user?.nama ||
                        item?.username ||
                        `Peserta ${index + 1}`;

                      const nik =
                        item?.nik ||
                        item?.no_identitas ||
                        "-";

                      return (
                        <div
                          key={`${getPesertaId(
                            item
                          )}-${index}`}
                          className="rounded-lg border border-[#071E3D]/10 bg-[#FAFAFA] p-4"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
                              <UserRound
                                size={17}
                              />
                            </div>

                            <div className="min-w-0">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-[#182D4A]/50">
                                Peserta {index + 1}
                              </p>

                              <p className="mt-1 truncate text-[13px] font-bold text-[#071E3D]">
                                {namaPeserta}
                              </p>

                              <p className="mt-1 truncate text-[11px] font-medium text-[#182D4A]/60">
                                NIK: {nik}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-[#071E3D]/15 bg-[#FAFAFA] p-10 text-center">
                  <Users
                    size={36}
                    className="mx-auto mb-3 text-[#071E3D]/20"
                  />

                  <h3 className="text-[14px] font-bold text-[#071E3D]">
                    Belum Ada Peserta
                  </h3>

                  <p className="mx-auto mt-1 max-w-md text-[11px] font-medium leading-relaxed text-[#182D4A]/60">
                    Belum ada peserta yang ditugaskan kepada Anda untuk jadwal ini.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
}) {
  return (
    <div className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-5 py-3.5 md:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#CC6B27]">
          {icon}
        </div>

        <div className="min-w-0">
          <h2 className="text-[12px] font-bold uppercase tracking-wider text-white">
            {title}
          </h2>

          <p className="mt-0.5 text-[10px] font-medium text-white/55">
            {subtitle}
          </p>
        </div>
      </div>
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
    red:
      "bg-red-50 text-red-500",
    gray:
      "bg-slate-100 text-slate-500",
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

        <p className="mt-1 truncate text-[16px] font-black text-[#071E3D]">
          {value}
        </p>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
  description,
}) {
  return (
    <div className="rounded-lg border border-[#071E3D]/10 bg-[#FAFAFA] p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#CC6B27] shadow-sm">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#182D4A]/50">
            {label}
          </p>

          <p className="mt-1 break-words text-[13px] font-bold leading-snug text-[#071E3D]">
            {value || "-"}
          </p>

          {description && (
            <p className="mt-1 text-[10px] font-medium leading-relaxed text-[#182D4A]/55">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function getPesertaId(item) {
  return (
    item?.id_peserta ||
    item?.id_peserta_jadwal ||
    item?.id ||
    item?.id_pendaftaran ||
    "peserta"
  );
}

function formatTanggalSingkat(
  value
) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return value;
  }

  return parsed.toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );
}