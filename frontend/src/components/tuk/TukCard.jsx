
import React from "react";
import { MapPin, Navigation, Phone } from "lucide-react";

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
  const jenis = formatJenisTuk(tuk.jenis_tuk);
  const nomorTelepon = tuk.telepon || tuk.no_hp || tuk.nomor_hp || "Belum tersedia";

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

        <span className="shrink-0 rounded-md border border-[#D5E2F1] bg-[#EAF1FA] px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-[0.08em] text-[#071E3D]">
          {jenis}
        </span>
      </div>

      <div className="mt-5 flex-1 space-y-4">
        <div className="flex items-start gap-3">
          <MapPin size={16} className="mt-0.5 shrink-0 text-[#CC6B27]" />

          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Lokasi
            </p>

            <p className="mt-1 break-words text-xs font-semibold leading-5 text-[#071E3D]">
              {alamat || "Alamat belum tersedia"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Phone size={16} className="mt-0.5 shrink-0 text-[#CC6B27]" />

          <div className="min-w-0">
            <p className="text-[8px] font-bold uppercase tracking-[0.13em] text-slate-400">
              Nomor Telepon Penanggung Jawab
            </p>

            <p className="mt-1 break-words text-[11px] font-semibold text-[#071E3D]">
              {nomorTelepon}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
