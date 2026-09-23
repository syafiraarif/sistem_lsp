import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  MapPin,
  Building2,
} from "lucide-react";

export default function JadwalDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { schedule } = location.state || {};

  if (!schedule) {
    return (
      <section className="min-h-screen bg-[#FAFAFA] px-6 py-16">
        <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
          <div className="w-full rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
              <CalendarDays size={25} />
            </div>

            <h1 className="mt-5 text-xl font-black text-[#071E3D]">
              Jadwal Tidak Ditemukan
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Data jadwal yang ingin Anda lihat tidak tersedia atau halaman
              dibuka tanpa memilih jadwal terlebih dahulu.
            </p>

            <button
              type="button"
              onClick={() => navigate("/jadwal")}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#071E3D] px-5 py-3 text-xs font-bold text-white transition-colors duration-200 hover:bg-[#CC6B27]"
            >
              <ArrowLeft size={15} />
              Kembali ke Jadwal
            </button>
          </div>
        </div>
      </section>
    );
  }

  const jadwal = schedule;

  const namaSkema =
    jadwal?.nama_kegiatan ||
    jadwal?.skema ||
    jadwal?.nama_skema ||
    jadwal?.skema?.judul_skema ||
    "Skema Sertifikasi";

  const namaTuk =
    jadwal?.tuk?.nama_tuk ||
    jadwal?.nama_tuk ||
    jadwal?.tuk ||
    "Tempat Uji Kompetensi";

  const alamatTuk =
    jadwal?.alamat ||
    [
      jadwal?.tuk?.alamat,
      jadwal?.tuk?.kota,
      jadwal?.tuk?.provinsi,
    ]
      .filter(Boolean)
      .join(", ") ||
    "Alamat belum tersedia";

  const tanggal =
    jadwal?.tgl_awal ||
    jadwal?.tanggal ||
    jadwal?.tanggal_uji ||
    "";

  const tanggalAkhir =
    jadwal?.tgl_akhir ||
    jadwal?.tanggal_selesai ||
    "";

  const waktu = jadwal?.jam || jadwal?.waktu || "Waktu belum tersedia";

  const jenis =
    jadwal?.pelaksanaan_uji ||
    jadwal?.jenis ||
    jadwal?.metode ||
    "Metode asesmen belum tersedia";

  const status = jadwal?.status || "Tersedia";

  const formatTanggal = (value) => {
    if (!value) return "Tanggal belum tersedia";

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return parsed.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatPeriode = () => {
    if (!tanggal) {
      return "Tanggal belum tersedia";
    }

    if (!tanggalAkhir || tanggalAkhir === tanggal) {
      return formatTanggal(tanggal);
    }

    return `${formatTanggal(tanggal)} – ${formatTanggal(tanggalAkhir)}`;
  };

  const getStatusClass = () => {
    const value = String(status).toLowerCase();

    if (
      value.includes("selesai") ||
      value.includes("tutup") ||
      value.includes("penuh")
    ) {
      return "bg-slate-100 text-slate-600";
    }

    if (
      value.includes("batal") ||
      value.includes("cancel")
    ) {
      return "bg-red-50 text-red-600";
    }

    return "bg-emerald-50 text-emerald-600";
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-white py-10 sm:py-14 lg:py-16">
      <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-[#CC6B27]/[0.035] blur-[100px]" />

      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#071E3D]/[0.025] blur-[90px]" />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center gap-2 text-xs font-bold text-slate-500 transition-colors duration-200 hover:text-[#071E3D]"
        >
          <ArrowLeft size={16} />
          Kembali ke Jadwal
        </button>

        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-4 h-1 w-10 bg-[#CC6B27]" />

          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#CC6B27]">
            Detail Jadwal Asesmen
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#071E3D] sm:text-4xl">
            {namaSkema}
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Informasi lengkap jadwal pelaksanaan uji kompetensi yang telah
            tersedia pada sistem.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_18px_45px_-30px_rgba(7,30,61,0.18)]">
          <div className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-5 py-5 sm:px-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#CC6B27]">
                  <ClipboardCheck size={19} />
                </div>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#CC6B27]">
                    Skema Sertifikasi
                  </p>

                  <h2 className="mt-1 text-sm font-black leading-5 text-white sm:text-base">
                    {namaSkema}
                  </h2>
                </div>
              </div>

              <div
                className={`inline-flex w-fit items-center gap-2 rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] ${getStatusClass()}`}
              >
                <CheckCircle2 size={13} />
                {status}
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <DetailItem
                icon={CalendarDays}
                label="Tanggal"
                value={formatPeriode()}
              />

              <DetailItem
                icon={Clock3}
                label="Waktu"
                value={waktu}
              />

              <DetailItem
                icon={ClipboardCheck}
                label="Pelaksanaan"
                value={jenis}
              />

              <DetailItem
                icon={Building2}
                label="Tempat Uji"
                value={namaTuk}
              />
            </div>

            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
                  <MapPin size={17} />
                </div>

                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Lokasi Pelaksanaan
                  </p>

                  <h3 className="mt-1 text-sm font-black text-[#071E3D]">
                    {namaTuk}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {alamatTuk}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold text-[#071E3D]">
                  Siap mengikuti uji kompetensi?
                </p>

                <p className="mt-1 text-[11px] leading-5 text-slate-400">
                  Pastikan data dan persyaratan pendaftaran sudah dipersiapkan
                  sebelum melanjutkan.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/pendaftaran")}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#CC6B27] px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition-colors duration-200 hover:bg-[#071E3D]"
              >
                Ikuti Asesmen
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 bg-[#FAFAFA] px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#071E3D]/5 text-[#071E3D]">
              <ClipboardCheck size={15} />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#071E3D]">
                Informasi
              </p>

              <p className="mt-1 text-[11px] leading-5 text-slate-500">
                Jadwal dapat berubah sesuai kebijakan pelaksanaan. Pastikan
                informasi terbaru diperiksa sebelum mengikuti asesmen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
          <Icon size={15} />
        </div>

        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
            {label}
          </p>

          <p className="mt-1 text-xs font-bold leading-5 text-[#071E3D]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}