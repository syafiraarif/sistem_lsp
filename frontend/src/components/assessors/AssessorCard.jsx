import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Award,
  Building2,
} from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

export default function AssessorCard({
  id,
  id_asesor,
  nama,
  nama_lengkap,
  foto,
  foto_profil,
  bidang_keahlian,
  unit_kerja,
  nama_tuk,
  tuk,
  tempat,
  no_reg_asesor,
  status_asesor,
}) {
  const navigate = useNavigate();

  const assessorId =
    id ||
    id_asesor;

  const displayName =
    nama_lengkap ||
    nama ||
    "Nama Asesor";

  const expertise =
    bidang_keahlian ||
    "Bidang keahlian belum tersedia";

  const unitKerja =
    unit_kerja ||
    nama_tuk ||
    tuk ||
    tempat ||
    "Belum tersedia";

  const isActive =
    !status_asesor ||
    String(status_asesor).toLowerCase() === "aktif";

  const imagePath =
    foto_profil ||
    foto ||
    "";

  const getImageUrl = (path) => {
    if (!path) {
      return "";
    }

    const value = String(path);

    if (
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("data:")
    ) {
      return value;
    }

    const baseUrl = API_BASE.replace(/\/api\/?$/, "");

    return `${baseUrl}/${value.replace(/^\/+/, "")}`;
  };

  const imageUrl = getImageUrl(imagePath);

  const getInitial = () => {
    const words = displayName
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }

    return displayName.charAt(0).toUpperCase() || "A";
  };

  const handleDetail = () => {
    if (!assessorId) {
      return;
    }

    navigate(`/explore-assessors/${assessorId}`);
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[28px] border-2 border-[#CC6B27]/25 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#CC6B27]/45 hover:shadow-lg">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-[146px] w-[146px] items-center justify-center overflow-hidden rounded-[24px] border-2 border-[#CC6B27]/25 bg-[#FAFAFA]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={displayName}
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display = "none";
                event.currentTarget.nextElementSibling?.classList.remove(
                  "hidden"
                );
              }}
            />
          ) : null}

          <div
            className={`${
              imageUrl ? "hidden" : "flex"
            } h-full w-full items-center justify-center`}
          >
            <span className="text-[42px] font-black text-[#071E3D]">
              {getInitial()}
            </span>
          </div>
        </div>

        <h3 className="mt-5 line-clamp-2 text-[18px] font-black leading-snug text-[#071E3D]">
          {displayName}
        </h3>

        <p
          className={`mt-0.5 text-[9px] font-black uppercase tracking-[0.2em] ${
            isActive
              ? "text-[#182D4A]/60"
              : "text-red-500"
          }`}
        >
          {isActive
            ? "Asesor Tersertifikasi"
            : "Non-Aktif"}
        </p>
      </div>

      <div className="my-6 border-t border-[#071E3D]/10" />

      <div className="space-y-4">
        <InfoRow
          icon={<Award size={18} />}
          label="Bidang Keahlian"
          value={expertise}
        />

        <InfoRow
          icon={<Building2 size={18} />}
          label="Unit Kerja / TUK"
          value={unitKerja}
        />
      </div>

      <div className="mt-auto pt-6">
        <button
          type="button"
          onClick={handleDetail}
          disabled={!assessorId}
          className="group/button flex w-full items-center justify-center gap-2 rounded-xl bg-[#071E3D] px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-white transition-all duration-200 hover:bg-[#CC6B27] disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Detail Profile

          <ArrowUpRight
            size={15}
            className="transition-transform duration-200 group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5"
          />
        </button>
      </div>
    </article>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#CC6B27]/10 text-[#CC6B27]">
        {icon}
      </div>

      <div className="min-w-0 pt-0.5">
        <p className="text-[9px] font-black uppercase tracking-widest text-[#182D4A]/45">
          {label}
        </p>

        <p className="mt-1 line-clamp-2 text-[12px] font-bold leading-relaxed text-[#071E3D]">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}