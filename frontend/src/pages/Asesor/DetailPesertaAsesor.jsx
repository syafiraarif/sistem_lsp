import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import SidebarAsesor from "../../components/sidebar/SidebarAsesor";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Loader2,
  Map,
  RefreshCcw,
  ShieldCheck,
  User,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { notifikasi } from "../../components/ui/notifikasi";
import api from "../../services/api";

const PROGRESS_INTERVAL = 2000;

export default function DetailPesertaAsesor() {
  const navigate = useNavigate();
  const { id_jadwal, id_peserta } = useParams();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [peserta, setPeserta] = useState(null);
  const [hasilKeputusan, setHasilKeputusan] = useState("");
  const [nilaiAkhir, setNilaiAkhir] = useState("");
  const [catatanAsesor, setCatatanAsesor] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchPeserta = useCallback(
    async (showLoading = true, showSuccess = false) => {
      try {
        if (showLoading) {
          setLoading(true);
        }

        const res = await api.get(`/asesor/peserta/${id_peserta}`, {
          params: {
            _t: Date.now(),
          },
        });

        const data = res?.data?.data || res?.data || {};

        setPeserta(data);
        setHasilKeputusan(data?.status_asesmen || "");
        setNilaiAkhir(data?.nilai_akhir ?? "");
        setCatatanAsesor(data?.keterangan || "");

        if (showSuccess) {
          await notifikasi.sukses(
            "Berhasil",
            "Data peserta berhasil diperbarui."
          );
        }
      } catch (err) {
        console.error("Gagal mengambil detail peserta:", err);

        const message =
          err?.response?.data?.message ||
          "Data peserta tidak dapat dimuat.";

        if (showSuccess) {
          await notifikasi.gagal("Gagal", message);
        } else {
          await notifikasi.peringatan(
            "Data Tidak Tersedia",
            message
          );
        }
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [id_peserta]
  );

  const refreshProgress = useCallback(async () => {
    try {
      const res = await api.get(`/asesor/peserta/${id_peserta}`, {
        params: {
          _t: Date.now(),
        },
      });

      const data = res?.data?.data || res?.data || {};

      setPeserta((current) => {
        if (!current) {
          return data;
        }

        return {
          ...current,
          ...data,
          kelengkapan:
            data?.kelengkapan ||
            current?.kelengkapan ||
            {},
        };
      });
    } catch (error) {
      console.error(
        "Gagal memperbarui progress asesmen:",
        error
      );
    }
  }, [id_peserta]);

  useEffect(() => {
    if (id_peserta) {
      fetchPeserta(true, false);
    }
  }, [fetchPeserta, id_peserta]);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshProgress();
    }, PROGRESS_INTERVAL);

    const handleFocus = () => {
      refreshProgress();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [refreshProgress]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshProgress();
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [refreshProgress]);

  const handleSimpanHasil = async () => {
    if (!hasilKeputusan) {
      await notifikasi.peringatan(
        "Hasil Belum Dipilih",
        "Silakan pilih hasil keputusan terlebih dahulu."
      );
      return;
    }

    if (nilaiAkhir === "") {
      await notifikasi.peringatan(
        "Nilai Belum Diisi",
        "Silakan masukkan nilai akhir peserta."
      );
      return;
    }

    if (Number(nilaiAkhir) < 0 || Number(nilaiAkhir) > 100) {
      await notifikasi.peringatan(
        "Nilai Tidak Valid",
        "Nilai akhir harus berada di antara 0 sampai 100."
      );
      return;
    }

    try {
      setSaving(true);

      const res = await api.post(
        "/asesor/hasil-keputusan",
        {
          id_peserta: Number(id_peserta),
          id_jadwal: Number(id_jadwal),
          hasil: hasilKeputusan,
          nilai_akhir: Number(nilaiAkhir),
          catatan_asesor: catatanAsesor,
        }
      );

      setPeserta((prev) => ({
        ...prev,
        status_asesmen: hasilKeputusan,
        nilai_akhir: Number(nilaiAkhir),
        keterangan: catatanAsesor,
      }));

      await refreshProgress();

      await notifikasi.sukses(
        "Berhasil",
        res?.data?.message ||
          "Hasil asesmen berhasil disimpan."
      );
    } catch (err) {
      console.error(
        "Gagal menyimpan hasil asesmen:",
        err
      );

      await notifikasi.gagal(
        "Gagal",
        err?.response?.data?.message ||
          "Hasil asesmen gagal disimpan."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleKelolaAsesmen = async () => {
    try {
      const response = await api.get(
        `/asesor/presensi/cek?id_jadwal=${id_jadwal}`
      );

      if (response.data?.hadir) {
        return true;
      }

      const result = await Swal.fire({
        icon: "warning",
        title: "Presensi Diperlukan",
        text: "Anda belum melakukan presensi. Silakan lakukan presensi terlebih dahulu sebelum mengelola asesmen.",
        showCancelButton: true,
        confirmButtonText: "Presensi Sekarang",
        cancelButtonText: "Nanti",
        confirmButtonColor: "#CC6B27",
        cancelButtonColor: "#64748B",
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        navigate(`/asesor/presensi/${id_jadwal}`);
      }

      return false;
    } catch (err) {
      console.error(
        "CHECK PRESENSI ERROR:",
        err
      );

      const status = err.response?.status;
      const message =
        err.response?.data?.message ||
        "Tidak dapat memeriksa status presensi.";

      if (status === 401) {
        await notifikasi.peringatan(
          "Sesi Berakhir",
          "Sesi login Anda sudah berakhir. Silakan login kembali."
        );

        navigate("/login");
        return false;
      }

      await notifikasi.gagal(
        "Presensi Tidak Dapat Diperiksa",
        message
      );

      return false;
    }
  };

  const daftarForm = useMemo(
    () => [
      {
        key: "mapa01",
        label: "MAPA01",
        group: "MAPA",
        icon: <Map size={18} />,
      },
      {
        key: "mapa02",
        label: "MAPA02",
        group: "MAPA",
        icon: <Map size={18} />,
      },
      {
        key: "fria01",
        label: "FR.IA.01",
        group: "FR.IA",
        icon: <FileText size={18} />,
      },
      {
        key: "fria02",
        label: "FR.IA.02",
        group: "FR.IA",
        icon: <FileText size={18} />,
      },
      {
        key: "fria03",
        label: "FR.IA.03",
        group: "FR.IA",
        icon: <FileText size={18} />,
      },
      {
        key: "fria05",
        label: "FR.IA.05",
        group: "FR.IA",
        icon: <FileText size={18} />,
      },
      {
        key: "frak01",
        label: "FR.AK.01",
        group: "FR.AK",
        icon: <ClipboardCheck size={18} />,
      },
      {
        key: "frak02",
        label: "FR.AK.02",
        group: "FR.AK",
        icon: <ClipboardCheck size={18} />,
      },
      {
        key: "frak05",
        label: "FR.AK.05",
        group: "FR.AK",
        icon: <ClipboardCheck size={18} />,
      },
      {
        key: "frak06",
        label: "FR.AK.06",
        group: "FR.AK",
        icon: <ClipboardCheck size={18} />,
      },
      {
        key: "frak07",
        label: "FR.AK.07",
        group: "FR.AK",
        icon: <ClipboardCheck size={18} />,
      },
    ],
    []
  );

  const kelengkapan = peserta?.kelengkapan || {};
  const totalForm = daftarForm.length;

  const selesai = daftarForm.filter((form) =>
    isFormFilled(kelengkapan?.[form.key])
  ).length;

  const persen =
    totalForm > 0
      ? Math.round((selesai / totalForm) * 100)
      : 0;

  const getFormAction = (formKey) => {
    switch (formKey) {
      case "mapa01":
        return () =>
          navigate(
            `/asesor/mapa01/${id_jadwal}/${id_peserta}`
          );

      case "mapa02":
        return () =>
          navigate(
            `/asesor/mapa02/${id_jadwal}/${id_peserta}`
          );

      case "fria01":
        return () =>
          navigate(
            `/asesor/fr-ia01/${id_jadwal}/${id_peserta}`
          );

      case "fria02":
        return () =>
          navigate(
            `/asesor/fr-ia02/${id_jadwal}/${id_peserta}`
          );

      case "fria03":
        return () =>
          navigate(
            `/asesor/fr-ia03/asesor/${id_jadwal}/${id_peserta}`
          );

      case "fria05":
        return () =>
          navigate(
            `/asesor/fr-ia05/${id_jadwal}/${id_peserta}`
          );

      case "frak01":
        return () =>
          navigate(
            `/asesor/fr-ak01/${id_jadwal}/${id_peserta}`
          );

      case "frak02":
        return () =>
          navigate(
            `/asesor/fr-ak02/${id_jadwal}/${id_peserta}`
          );

      case "frak05":
        return () =>
          navigate(
            `/asesor/fr-ak05/${id_jadwal}/${id_peserta}`
          );

      case "frak06":
        return () =>
          navigate(
            `/asesor/fr-ak06/${id_jadwal}/${id_peserta}`
          );

      case "frak07":
        return () =>
          navigate(
            `/asesor/fr-ak07/${id_jadwal}/${id_peserta}`
          );

      default:
        return undefined;
    }
  };

  const handleBack = () => {
    navigate(
      `/asesor/jadwal-saya/${id_jadwal}/peserta`
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex">
        <SidebarAsesor
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />

        <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">
          <div className="mx-auto flex min-h-[70vh] w-full max-w-[1500px] items-center justify-center">
            <LoadingScreen />
          </div>
        </main>
      </div>
    );
  }

  if (!peserta) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex">
        <SidebarAsesor
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />

        <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">
          <div className="mx-auto flex min-h-[70vh] w-full max-w-[1500px] items-center justify-center">
            <div className="w-full max-w-md overflow-hidden rounded-xl border border-red-100 bg-white shadow-sm">
              <div className="border-b-4 border-red-400 bg-[#071E3D] px-6 py-4">
                <div className="flex items-center gap-3 text-white">
                  <XCircle
                    size={19}
                    className="text-red-400"
                  />

                  <h2 className="text-[14px] font-bold uppercase tracking-wider">
                    Data Peserta Tidak Ditemukan
                  </h2>
                </div>
              </div>

              <div className="p-8 text-center">
                <p className="text-[13px] font-medium text-[#182D4A]/70">
                  Data peserta tidak dapat ditampilkan.
                </p>

                <button
                  type="button"
                  onClick={handleBack}
                  className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[#CC6B27] bg-[#CC6B27] px-5 py-2.5 text-[12px] font-bold text-white transition-all hover:border-[#A8561F] hover:bg-[#A8561F]"
                >
                  <ArrowLeft size={16} />
                  Kembali
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
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-[1500px] space-y-5">
          <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
            <div className="border-b border-[#071E3D]/10 px-5 py-5 md:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <h1 className="text-[24px] font-black text-[#071E3D] md:text-[28px]">
                    Detail Peserta Asesor
                  </h1>

                  <p className="mt-1 text-[13px] font-medium text-[#182D4A]/70">
                    Periksa kelengkapan dokumen dan formulir asesmen peserta.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    fetchPeserta(true, true)
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
          </section>

          <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
            <SectionHeader
              icon={<User size={17} />}
              title="Informasi Peserta"
              subtitle="Identitas peserta uji kompetensi."
            />

            <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2 md:p-6 lg:grid-cols-3">
              <InfoCard
                icon={<UserCheck size={17} />}
                label="Nama Peserta"
                value={
                  peserta?.nama_lengkap || "-"
                }
              />

              <InfoCard
                icon={<BadgeCheck size={17} />}
                label="NIK"
                value={peserta?.nik || "-"}
              />

              <InfoCard
                icon={<FileText size={17} />}
                label="Email"
                value={peserta?.email || "-"}
              />

              <InfoCard
                icon={<Users size={17} />}
                label="No. HP"
                value={peserta?.no_hp || "-"}
              />

              <InfoCard
                icon={<ShieldCheck size={17} />}
                label="Status Asesmen"
                value={formatStatus(
                  peserta?.status_asesmen
                )}
                tone={getStatusTone(
                  peserta?.status_asesmen
                )}
              />

              <InfoCard
                icon={<ClipboardCheck size={17} />}
                label="ID Peserta"
                value={id_peserta || "-"}
              />
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
            <SectionHeader
              icon={<ClipboardCheck size={17} />}
              title="Progress Asesmen"
              subtitle="Kelengkapan seluruh formulir asesmen peserta."
            />

            <div className="p-5 md:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#182D4A]/50">
                    Kelengkapan Formulir
                  </p>

                  <p className="mt-1 text-[13px] font-bold text-[#071E3D]">
                    {selesai} dari {totalForm} formulir telah selesai.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-[#CC6B27]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#CC6B27]">
                    {selesai} / {totalForm} Form
                  </span>

                  <span className="rounded-lg bg-[#071E3D] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    {persen}%
                  </span>
                </div>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-lg bg-[#071E3D]/10">
                <div
                  className="h-full rounded-lg bg-[#CC6B27] transition-all duration-500"
                  style={{
                    width: `${persen}%`,
                  }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-[#182D4A]/55">
                <span>
                  {selesai} formulir selesai
                </span>

                <span>
                  {totalForm - selesai} formulir belum selesai
                </span>
              </div>
            </div>
          </section>

          <FormSection
            title="MAPA"
            subtitle="Matriks Asesmen dan Perencanaan Asesmen"
            icon={<Map size={17} />}
            forms={daftarForm.filter(
              (item) => item.group === "MAPA"
            )}
            kelengkapan={kelengkapan}
            getFormAction={getFormAction}
          />

          <FormSection
            title="FR.IA"
            subtitle="Formulir Instrumen Asesmen"
            icon={<FileText size={17} />}
            forms={daftarForm.filter(
              (item) => item.group === "FR.IA"
            )}
            kelengkapan={kelengkapan}
            getFormAction={getFormAction}
          />

          <FormSection
            title="FR.AK"
            subtitle="Formulir Rekaman Asesmen Kompetensi"
            icon={<ClipboardCheck size={17} />}
            forms={daftarForm.filter(
              (item) => item.group === "FR.AK"
            )}
            kelengkapan={kelengkapan}
            getFormAction={getFormAction}
          />

          <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
            <SectionHeader
              icon={<BadgeCheck size={17} />}
              title="Hasil Asesmen"
              subtitle="Input dan ubah hasil penilaian peserta."
            />

            <div className="space-y-5 p-5 md:p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField label="Hasil Keputusan">
                  <select
                    value={hasilKeputusan}
                    onChange={(e) =>
                      setHasilKeputusan(
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-3.5 py-3 text-[13px] font-bold text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
                  >
                    <option value="">
                      Pilih Hasil Keputusan
                    </option>

                    <option value="kompeten">
                      Kompeten
                    </option>

                    <option value="belum_kompeten">
                      Belum Kompeten
                    </option>
                  </select>
                </FormField>

                <FormField label="Nilai Akhir">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={nilaiAkhir}
                    onChange={(e) =>
                      setNilaiAkhir(
                        e.target.value
                      )
                    }
                    placeholder="Masukkan nilai 0 - 100"
                    className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-3.5 py-3 text-[13px] font-bold text-[#071E3D] outline-none transition-all placeholder:text-[#182D4A]/40 focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
                  />
                </FormField>

                <div className="md:col-span-2">
                  <FormField label="Catatan Asesor">
                    <textarea
                      value={catatanAsesor}
                      onChange={(e) =>
                        setCatatanAsesor(
                          e.target.value
                        )
                      }
                      rows={5}
                      placeholder="Masukkan catatan hasil asesmen peserta..."
                      className="w-full resize-none rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-3.5 py-3 text-[13px] font-medium text-[#071E3D] outline-none transition-all placeholder:text-[#182D4A]/40 focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
                    />
                  </FormField>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-[#071E3D]/10 bg-[#FAFAFA] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#182D4A]/50">
                    Penyimpanan Hasil
                  </p>

                  <p className="mt-1 text-[11px] font-medium text-[#182D4A]/60">
                    Pastikan hasil dan nilai sudah sesuai sebelum disimpan.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSimpanHasil}
                  disabled={saving}
                  className="rounded-lg border border-[#CC6B27] bg-[#CC6B27] px-5 py-2.5 text-[12px] font-bold text-white shadow-sm transition-all hover:border-[#A8561F] hover:bg-[#A8561F] disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300"
                >
                  <span className="flex items-center justify-center gap-2">
                    {saving ? (
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />
                    ) : (
                      <CheckCircle2 size={15} />
                    )}

                    {saving
                      ? "Menyimpan..."
                      : "Simpan Hasil Asesmen"}
                  </span>
                </button>
              </div>
            </div>
          </section>

          <div className="flex justify-start pb-3">
          </div>
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

        <div>
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-white">
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

function FormSection({
  title,
  subtitle,
  icon,
  forms,
  kelengkapan,
  getFormAction,
}) {
  const jumlahSelesai = forms.filter(
    (item) =>
      isFormFilled(
        kelengkapan?.[item.key]
      )
  ).length;

  return (
    <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
      <div className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-5 py-3.5 md:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#CC6B27]">
              {icon}
            </div>

            <div>
              <h2 className="text-[13px] font-bold uppercase tracking-wider text-white">
                {title}
              </h2>

              <p className="mt-0.5 text-[10px] font-medium text-white/55">
                {subtitle}
              </p>
            </div>
          </div>

          <span className="w-fit rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/70">
            {jumlahSelesai} / {forms.length} Selesai
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 md:p-6 lg:grid-cols-3 xl:grid-cols-4">
        {forms.map((form) => {
          const status = isFormFilled(
            kelengkapan?.[form.key]
          );

          const action = getFormAction(
            form.key
          );

          return (
            <button
              key={form.key}
              type="button"
              onClick={action}
              disabled={!action}
              className={`group flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all ${
                status
                  ? "border-green-200 bg-green-50 hover:border-green-300 hover:bg-green-100"
                  : "border-[#071E3D]/10 bg-[#FAFAFA] hover:border-[#CC6B27]/40 hover:bg-[#CC6B27]/5"
              } ${
                !action
                  ? "cursor-not-allowed opacity-60"
                  : ""
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  status
                    ? "bg-green-100 text-green-600"
                    : "bg-[#CC6B27]/10 text-[#CC6B27]"
                }`}
              >
                {status ? (
                  <CheckCircle2 size={18} />
                ) : (
                  form.icon
                )}
              </div>

              <div className="min-w-0">
                <p
                  className={`text-[12px] font-black ${
                    status
                      ? "text-green-700"
                      : "text-[#071E3D]"
                  }`}
                >
                  {form.label}
                </p>

                <p
                  className={`mt-0.5 text-[10px] font-semibold ${
                    status
                      ? "text-green-600"
                      : "text-[#182D4A]/50"
                  }`}
                >
                  {status
                    ? "Sudah diisi"
                    : "Belum diisi"}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function FormField({
  label,
  children,
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-[#182D4A]/60">
        {label}
      </label>

      {children}
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
  tone = "orange",
}) {
  const tones = {
    orange: {
      box: "bg-[#CC6B27]/10 text-[#CC6B27]",
      value: "text-[#071E3D]",
    },
    green: {
      box: "bg-green-50 text-green-600",
      value: "text-green-600",
    },
    red: {
      box: "bg-red-50 text-red-500",
      value: "text-red-500",
    },
    gray: {
      box: "bg-slate-100 text-slate-500",
      value: "text-[#071E3D]",
    },
  };

  const current =
    tones[tone] || tones.orange;

  return (
    <div className="rounded-lg border border-[#071E3D]/10 bg-[#FAFAFA] p-4 transition-all hover:border-[#CC6B27]/20 hover:bg-white">
      <div
        className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${current.box}`}
      >
        {icon}
      </div>

      <p className="text-[10px] font-bold uppercase tracking-wider text-[#182D4A]/50">
        {label}
      </p>

      <p
        className={`mt-1.5 line-clamp-2 text-[13px] font-bold ${current.value}`}
      >
        {value || "-"}
      </p>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="w-full max-w-md overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
      <div className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-6 py-4">
        <div className="flex items-center gap-3">
          <Loader2
            size={18}
            className="animate-spin text-[#CC6B27]"
          />

          <h2 className="text-[13px] font-bold uppercase tracking-wider text-white">
            Memuat Detail Peserta
          </h2>
        </div>
      </div>

      <div className="p-8 text-center">
        <p className="text-[13px] font-medium text-[#182D4A]/70">
          Sedang mengambil data peserta dan kelengkapan asesmen.
        </p>
      </div>
    </div>
  );
}

function isFormFilled(value) {
  if (
    value === true ||
    value === 1 ||
    value === "1" ||
    value === "true" ||
    value === "aktif" ||
    value === "selesai" ||
    value === "sudah_diisi" ||
    value === "sudah"
  ) {
    return true;
  }

  if (
    value === false ||
    value === 0 ||
    value === "0" ||
    value === "false" ||
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return false;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "object") {
    return Object.keys(value).length > 0;
  }

  return Boolean(value);
}

function getStatusTone(status) {
  const normalized = String(
    status || ""
  )
    .toLowerCase()
    .trim();

  if (normalized === "kompeten") {
    return "green";
  }

  if (
    normalized === "belum_kompeten" ||
    normalized === "belum kompeten"
  ) {
    return "red";
  }

  return "gray";
}

function formatStatus(status) {
  if (!status) {
    return "Belum Dinilai";
  }

  const value = String(status)
    .toLowerCase()
    .trim();

  if (value === "kompeten") {
    return "Kompeten";
  }

  if (
    value === "belum kompeten" ||
    value === "belum_kompeten"
  ) {
    return "Belum Kompeten";
  }

  if (
    value === "terdaftar" ||
    value === "pra_asesmen" ||
    value === "asesmen"
  ) {
    return "Belum Dinilai";
  }

  return status;
}