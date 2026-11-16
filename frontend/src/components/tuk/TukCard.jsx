
import React from "react";
import { Building2, MapPin, Navigation, UserRound } from "lucide-react";

const formatJenisTuk = (jenis) => {
  const value = String(jenis || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  const labels = {
    mandiri: "TUK Mandiri",
    tuk_mandiri: "TUK Mandiri",
    sewaktu: "TUK Sewaktu",
    tuk_sewaktu: "TUK Sewaktu",
    tempat_kerja: "Tempat Kerja",
    tuk_tempat_kerja: "Tempat Kerja",
  };

  return labels[value] || "TUK Terdaftar";
};

export default function TukCard({ tuk = {} }) {
  const lokasi = [tuk.kota, tuk.provinsi].filter(Boolean).join(", ");
  const jenis = formatJenisTuk(tuk.jenis_tuk);
  const penanggungJawab = tuk.nama_penanggung_jawab || "Belum tersedia";
  const statusAktif = String(tuk.status || "aktif").toLowerCase() === "aktif";
  const alamat = [
    tuk.alamat,
    tuk.kelurahan ? `Kelurahan ${tuk.kelurahan}` : null,
    tuk.kecamatan ? `Kecamatan ${tuk.kecamatan}` : null,
    tuk.kota,
    tuk.provinsi,
    tuk.kode_pos,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#CC6B27]/25 border-l-[3px] border-l-[#CC6B27] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#CC6B27]/50 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
            <Navigation size={19} />
          </div>

          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#CC6B27]">
              Tempat Uji Kompetensi
            </p>
            <h3 className="mt-1 break-words text-base font-black leading-snug text-[#071E3D]">
              {tuk.nama_tuk || "Nama TUK"}
            </h3>
            {tuk.kode_tuk && (
              <p className="mt-1 text-[10px] font-medium text-slate-400">
                {tuk.kode_tuk}
              </p>
            )}
          </div>
        </div>

        <span className="shrink-0 rounded-md bg-[#CC6B27]/10 px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-[0.08em] text-[#CC6B27]">
          {jenis}
        </span>
      </div>

      <div className="mt-5 flex-1 rounded-xl bg-[#F5F6F8] p-4">
        <div className="flex items-start gap-3">
          <MapPin size={16} className="mt-0.5 shrink-0 text-[#CC6B27]" />
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Lokasi
            </p>
            <p className="mt-1 break-words text-xs font-semibold leading-5 text-[#071E3D]">
              {alamat || "Alamat belum tersedia"}
            </p>
            {lokasi && (
              <p className="mt-2 text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                {lokasi}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#071E3D]/5 text-[#071E3D]">
            <UserRound size={15} />
          </div>
          <div className="min-w-0">
            <p className="text-[8px] font-bold uppercase tracking-[0.13em] text-slate-400">
              Penanggung Jawab
            </p>
            <p className="mt-0.5 truncate text-[11px] font-semibold text-[#071E3D]">
              {penanggungJawab}
            </p>
          </div>
        </div>

        <div
          className={`flex shrink-0 items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider ${
            statusAktif ? "text-green-700" : "text-slate-400"
          }`}
        >
        </div>
      </div>

      {tuk.institusi_induk && (
        <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 text-[10px] font-medium text-slate-500">
          <Building2 size={13} className="shrink-0 text-[#CC6B27]" />
          <span className="truncate">{tuk.institusi_induk}</span>
        </div>
      )}
    </article>
  );
}
