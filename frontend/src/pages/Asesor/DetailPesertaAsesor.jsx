import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Loader2,
  Map,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";

export default function DetailPesertaAsesor() {
  const navigate = useNavigate();
  const { id_jadwal, id_peserta } = useParams();

  const [loading, setLoading] = useState(true);
  const [peserta, setPeserta] = useState(null);
  const [hasilKeputusan, setHasilKeputusan] = useState("");
  const [nilaiAkhir, setNilaiAkhir] = useState("");
  const [catatanAsesor, setCatatanAsesor] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPeserta();
  }, [id_peserta, id_jadwal]);

  const fetchPeserta = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await axios.get(
        `http://localhost:3000/api/asesor/peserta/${id_peserta}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = res.data.data;

      setPeserta(data);
      setHasilKeputusan(data?.status_asesmen || "");
      setNilaiAkhir(data?.nilai_akhir ?? "");
      setCatatanAsesor(data?.keterangan || "");
    } catch (err) {
      console.error("Gagal mengambil detail peserta:", err);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text:
          err.response?.data?.message ||
          "Data peserta tidak ditemukan.",
        confirmButtonColor: "#CC6B27",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSimpanHasil = async () => {
    if (!hasilKeputusan) {
      Swal.fire({
        icon: "warning",
        title: "Hasil belum dipilih",
        text: "Silakan pilih hasil keputusan terlebih dahulu.",
        confirmButtonColor: "#CC6B27",
      });
      return;
    }

    if (nilaiAkhir === "") {
      Swal.fire({
        icon: "warning",
        title: "Nilai belum diisi",
        text: "Silakan masukkan nilai akhir peserta.",
        confirmButtonColor: "#CC6B27",
      });
      return;
    }

    if (Number(nilaiAkhir) < 0 || Number(nilaiAkhir) > 100) {
      Swal.fire({
        icon: "warning",
        title: "Nilai tidak valid",
        text: "Nilai akhir harus berada di antara 0 sampai 100.",
        confirmButtonColor: "#CC6B27",
      });
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:3000/api/asesor/hasil-keputusan",
        {
          id_peserta: Number(id_peserta),
          id_jadwal: Number(id_jadwal),
          hasil: hasilKeputusan,
          nilai_akhir: Number(nilaiAkhir),
          catatan_asesor: catatanAsesor,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPeserta((prev) => ({
        ...prev,
        status_asesmen: hasilKeputusan,
        nilai_akhir: Number(nilaiAkhir),
        keterangan: catatanAsesor,
      }));

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text:
          res.data?.message ||
          "Hasil asesmen berhasil disimpan.",
        confirmButtonColor: "#CC6B27",
      });
    } catch (err) {
      console.error("Gagal menyimpan hasil asesmen:", err);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text:
          err.response?.data?.message ||
          "Hasil asesmen gagal disimpan.",
        confirmButtonColor: "#CC6B27",
      });
    } finally {
      setSaving(false);
    }
  };

  const kelengkapan = peserta?.kelengkapan || {};

  const daftarForm = useMemo(
    () => [
      {
        key: "mapa01",
        label: "MAPA01",
        group: "MAPA",
      },
      {
        key: "mapa02",
        label: "MAPA02",
        group: "MAPA",
      },
      {
        key: "fria01",
        label: "FR.IA.01",
        group: "FR.IA",
      },
      {
        key: "fria02",
        label: "FR.IA.02",
        group: "FR.IA",
      },
      {
        key: "fria03",
        label: "FR.IA.03",
        group: "FR.IA",
      },
      {
        key: "fria05",
        label: "FR.IA.05",
        group: "FR.IA",
      },
      {
        key: "frak01",
        label: "FR.AK.01",
        group: "FR.AK",
      },
      {
        key: "frak02",
        label: "FR.AK.02",
        group: "FR.AK",
      },
      {
        key: "frak05",
        label: "FR.AK.05",
        group: "FR.AK",
      },
      {
        key: "frak06",
        label: "FR.AK.06",
        group: "FR.AK",
      },
      {
        key: "frak07",
        label: "FR.AK.07",
        group: "FR.AK",
      },
    ],
    []
  );

  const totalForm = daftarForm.length;

  const selesai = daftarForm.filter(
    (form) => kelengkapan?.[form.key]
  ).length;

  const persen =
    totalForm > 0
      ? Math.round((selesai / totalForm) * 100)
      : 0;

  const getButtonClass = (status) => {
    if (status) {
      return `
        group flex items-center gap-3 rounded-xl border
        border-green-200 bg-green-50 px-4 py-3 text-left
        transition-all hover:border-green-300 hover:bg-green-100
      `;
    }

    return `
      group flex items-center gap-3 rounded-xl border
      border-[#071E3D]/10 bg-[#FAFAFA] px-4 py-3 text-left
      transition-all hover:border-[#CC6B27]/40 hover:bg-[#CC6B27]/5
    `;
  };

  const getIconClass = (status) => {
    if (status) {
      return `
        flex h-9 w-9 shrink-0 items-center justify-center
        rounded-lg bg-green-100 text-green-600
      `;
    }

    return `
      flex h-9 w-9 shrink-0 items-center justify-center
      rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]
    `;
  };

  const openMenu = (url) => {
    navigate(url);
  };

  const openFRIA01 = () => {
    const idForm = peserta?.kelengkapan?.formId?.fria01;

    if (idForm) {
      navigate(`/asesor/fr-ia01/${idForm}`);
      return;
    }

    navigate(`/asesor/fr-ia01/${id_jadwal}/${id_peserta}`);
  };

  const openFRIA03 = () => {
    navigate(`/asesor/fr-ia03/asesor/${id_jadwal}/${id_peserta}`);
  };

  const getFormAction = (formKey) => {
    switch (formKey) {
      case "mapa01":
        return () =>
          openMenu(
            `/asesor/mapa01/${id_jadwal}/${id_peserta}`
          );

      case "mapa02":
        return () =>
          openMenu(
            `/asesor/mapa02/${id_jadwal}/${id_peserta}`
          );

      case "fria01":
        return openFRIA01;

      case "fria02":
        return () =>
          openMenu(`/asesor/fr-ia02/${id_jadwal}/${id_peserta}`);

      case "fria03":
        return openFRIA03;

      case "fria05":
        return () =>
          openMenu(
            `/asesor/fr-ia05/${id_jadwal}/${id_peserta}`
          );

      case "frak01":
        return () =>
          openMenu(
            `/asesor/fr-ak01/${id_jadwal}/${id_peserta}`
          );

      case "frak02":
        return () =>
          openMenu(
            `/asesor/fr-ak02/${id_jadwal}/${id_peserta}`
          );

      case "frak05":
        return () =>
          openMenu(
            `/asesor/fr-ak05/${id_jadwal}/${id_peserta}`
          );

      case "frak06":
        return () =>
          openMenu(
            `/asesor/fr-ak06/${id_jadwal}/${id_peserta}`
          );

      case "frak07":
        return () =>
          openMenu(
            `/asesor/fr-ak07/${id_jadwal}/${id_peserta}`
          );

      default:
        return undefined;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] p-6">
        <div className="w-full max-w-md rounded-xl border border-[#071E3D]/10 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[#CC6B27]/10 text-[#CC6B27]">
            <Loader2
              size={28}
              className="animate-spin"
            />
          </div>
          <h2 className="text-[18px] font-black text-[#071E3D]">
            Memuat Detail Peserta
          </h2>
          <p className="mt-2 text-[13px] font-medium text-[#182D4A]/70">
            Sedang mengambil data peserta dan kelengkapan asesmen.
          </p>
        </div>
      </div>
    );
  }

  if (!peserta) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] p-6">
        <div className="w-full max-w-md rounded-xl border border-red-100 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-red-50 text-red-500">
            <XCircle size={28} />
          </div>
          <h2 className="text-[18px] font-black text-[#071E3D]">
            Data Peserta Tidak Ditemukan
          </h2>
          <p className="mt-2 text-[13px] font-medium text-[#182D4A]/70">
            Data peserta tidak dapat ditampilkan.
          </p>
          <button
            type="button"
            onClick={() =>
              navigate(
                `/asesor/jadwal-saya/${id_jadwal}/peserta`
              )
            }
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#CC6B27] px-5 py-2.5 text-[13px] font-bold text-white transition-all hover:bg-[#a8561f]"
          >
            <ArrowLeft size={16} />
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 md:p-8">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-6">
        <section className="relative overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white p-6 shadow-sm">
          <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/2 rounded-full bg-[#CC6B27]/10 blur-3xl" />
          <div className="relative z-10 flex flex-col gap-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#CC6B27]/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-[#CC6B27]">
                  <Sparkles size={14} />
                  Kelola Asesmen
                </div>
                <h1 className="m-0 text-[24px] font-black text-[#071E3D] md:text-[28px]">
                  Detail Asesmen Peserta
                </h1>
                <p className="mt-1 text-[14px] font-medium text-[#182D4A]/70">
                  Periksa kelengkapan dokumen dan formulir asesmen peserta.
                </p>
              </div>
              <Link
                to={`/asesor/jadwal-saya/${id_jadwal}/peserta`}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#071E3D]/20 bg-white px-5 py-2.5 text-[13px] font-bold text-[#182D4A] transition-all hover:border-[#CC6B27] hover:bg-[#CC6B27]/5 hover:text-[#CC6B27]"
              >
                <ArrowLeft size={17} />
                Kembali
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-[#071E3D]/10 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
              <User size={19} />
            </div>
            <div>
              <h2 className="m-0 text-[16px] font-bold text-[#071E3D]">
                Informasi Peserta
              </h2>
              <p className="m-0 mt-0.5 text-[11px] font-medium text-[#182D4A]/60">
                Identitas peserta uji kompetensi
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <InfoCard
              icon={<UserCheck size={18} />}
              label="Nama Peserta"
              value={peserta.nama_lengkap || "-"}
            />
            <InfoCard
              icon={<BadgeCheck size={18} />}
              label="NIK"
              value={peserta.nik || "-"}
            />
            <InfoCard
              icon={<FileText size={18} />}
              label="Email"
              value={peserta.email || "-"}
            />
            <InfoCard
              icon={<Users size={18} />}
              label="No. HP"
              value={peserta.no_hp || "-"}
            />
            <InfoCard
              icon={<ShieldCheck size={18} />}
              label="Status Asesmen"
              value={formatStatus(peserta.status_asesmen)}
            />
            <InfoCard
              icon={<ClipboardCheck size={18} />}
              label="ID Peserta"
              value={id_peserta || "-"}
            />
          </div>
        </section>

        <section className="rounded-xl border border-[#071E3D]/10 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
                  <ClipboardCheck size={18} />
                </div>
                <h2 className="m-0 text-[16px] font-bold text-[#071E3D]">
                  Progress Asesmen
                </h2>
              </div>
              <p className="mt-2 text-[12px] font-medium text-[#182D4A]/60">
                Kelengkapan seluruh formulir asesmen peserta.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[#CC6B27]/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-[#CC6B27]">
                {selesai} / {totalForm} Form
              </span>
              <span className="rounded-full bg-[#071E3D] px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-white">
                {persen}%
              </span>
            </div>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-[#071E3D]/10">
            <div
              className="h-full rounded-full bg-[#CC6B27] transition-all duration-500"
              style={{
                width: `${persen}%`,
              }}
            />
          </div>

          <div className="mt-4 flex items-center justify-between text-[11px] font-semibold text-[#182D4A]/60">
            <span>{selesai} formulir selesai</span>
            <span>{totalForm - selesai} formulir belum selesai</span>
          </div>
        </section>

        <FormSection
          title="MAPA"
          subtitle="Matriks Asesmen dan Perencanaan Asesmen"
          icon={<Map size={18} />}
          forms={daftarForm.filter(
            (item) => item.group === "MAPA"
          )}
          kelengkapan={kelengkapan}
          getButtonClass={getButtonClass}
          getIconClass={getIconClass}
          getFormAction={getFormAction}
        />

        <FormSection
          title="FR.IA"
          subtitle="Formulir Instrumen Asesmen"
          icon={<FileText size={18} />}
          forms={daftarForm.filter(
            (item) => item.group === "FR.IA"
          )}
          kelengkapan={kelengkapan}
          getButtonClass={getButtonClass}
          getIconClass={getIconClass}
          getFormAction={getFormAction}
        />

        <FormSection
          title="FR.AK"
          subtitle="Formulir Rekaman Asesmen Kompetensi"
          icon={<ClipboardCheck size={18} />}
          forms={daftarForm.filter(
            (item) => item.group === "FR.AK"
          )}
          kelengkapan={kelengkapan}
          getButtonClass={getButtonClass}
          getIconClass={getIconClass}
          getFormAction={getFormAction}
        />

        <section className="rounded-xl border border-[#071E3D]/10 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
              <BadgeCheck size={19} />
            </div>
            <div>
              <h2 className="m-0 text-[16px] font-bold text-[#071E3D]">
                Hasil Asesmen
              </h2>
              <p className="m-0 mt-0.5 text-[11px] font-medium text-[#182D4A]/60">
                Input dan ubah hasil penilaian peserta
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-[11px] font-black uppercase tracking-wider text-[#182D4A]/60">
                Hasil Keputusan
              </label>
              <select
                value={hasilKeputusan}
                onChange={(e) =>
                  setHasilKeputusan(e.target.value)
                }
                className="w-full rounded-xl border border-[#071E3D]/10 bg-[#FAFAFA] px-4 py-3 text-[13px] font-bold text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
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
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-black uppercase tracking-wider text-[#182D4A]/60">
                Nilai Akhir
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={nilaiAkhir}
                onChange={(e) =>
                  setNilaiAkhir(e.target.value)
                }
                placeholder="Masukkan nilai 0 - 100"
                className="w-full rounded-xl border border-[#071E3D]/10 bg-[#FAFAFA] px-4 py-3 text-[13px] font-bold text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-[11px] font-black uppercase tracking-wider text-[#182D4A]/60">
                Catatan Asesor
              </label>
              <textarea
                value={catatanAsesor}
                onChange={(e) =>
                  setCatatanAsesor(e.target.value)
                }
                rows={5}
                placeholder="Masukkan catatan hasil asesmen peserta..."
                className="w-full resize-none rounded-xl border border-[#071E3D]/10 bg-[#FAFAFA] px-4 py-3 text-[13px] font-medium text-[#071E3D] outline-none transition-all placeholder:text-[#182D4A]/40 focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={handleSimpanHasil}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#CC6B27] px-6 py-3 text-[12px] font-black uppercase tracking-wider text-white transition-all hover:bg-[#a8561f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                  Menyimpan...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Simpan Hasil Asesmen
                </>
              )}
            </button>
          </div>
        </section>

        <div className="flex justify-start pb-4">
          <Link
            to={`/asesor/jadwal-saya/${id_jadwal}/peserta`}
            className="inline-flex items-center gap-2 rounded-lg border border-[#071E3D]/20 bg-white px-5 py-2.5 text-[13px] font-bold text-[#182D4A] shadow-sm transition-all hover:border-[#CC6B27] hover:bg-[#CC6B27]/5 hover:text-[#CC6B27]"
          >
            <ArrowLeft size={16} />
            Kembali ke Daftar Peserta
          </Link>
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
  getButtonClass,
  getIconClass,
  getFormAction,
}) {
  const jumlahSelesai = forms.filter(
    (item) => kelengkapan?.[item.key]
  ).length;

  return (
    <section className="rounded-xl border border-[#071E3D]/10 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
            {icon}
          </div>
          <div>
            <h2 className="m-0 text-[16px] font-bold text-[#071E3D]">
              {title}
            </h2>
            <p className="m-0 mt-0.5 text-[11px] font-medium text-[#182D4A]/60">
              {subtitle}
            </p>
          </div>
        </div>

        <span className="w-fit rounded-full border border-[#071E3D]/10 bg-[#FAFAFA] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#182D4A]/60">
          {jumlahSelesai} / {forms.length} Selesai
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {forms.map((form) => {
          const status = Boolean(
            kelengkapan?.[form.key]
          );

          const action = getFormAction(form.key);

          return (
            <button
              key={form.key}
              type="button"
              onClick={action}
              disabled={!action}
              className={`${getButtonClass(status)} ${
                !action
                  ? "cursor-not-allowed opacity-60"
                  : ""
              }`}
            >
              <div className={getIconClass(status)}>
                {status ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <FileText size={18} />
                )}
              </div>

              <div className="min-w-0">
                <p
                  className={`m-0 text-[12px] font-black ${
                    status
                      ? "text-green-700"
                      : "text-[#071E3D]"
                  }`}
                >
                  {form.label}
                </p>

                <p
                  className={`m-0 mt-0.5 text-[10px] font-semibold ${
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

function InfoCard({
  icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-[#071E3D]/10 bg-[#FAFAFA] p-4 transition-all hover:border-[#CC6B27]/20 hover:bg-white">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#CC6B27] shadow-sm">
        {icon}
      </div>
      <p className="m-0 text-[10px] font-bold uppercase tracking-widest text-[#182D4A]/55">
        {label}
      </p>
      <p className="m-0 mt-1.5 break-words text-[13px] font-bold text-[#071E3D]">
        {value || "-"}
      </p>
    </div>
  );
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