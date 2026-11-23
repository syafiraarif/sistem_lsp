import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Award, BadgeCheck, GraduationCap } from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

export default function AssessorCard({
  id,
  id_asesor,
  id_user,
  nama,
  nama_lengkap,
  foto,
  foto_profil,
  bidang_keahlian,
  no_reg_asesor,
  no_met,
  met,
  institut_asal,
  institution,
  universitas,
  perguruan_tinggi,
  pendidikan_terakhir,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const assessorId = id || id_asesor || id_user;

  const displayName = nama_lengkap || nama || "Nama Asesor";

  const university =
    institut_asal ||
    institution ||
    universitas ||
    perguruan_tinggi ||
    pendidikan_terakhir ||
    "";

  const nomorMet =
    no_reg_asesor || no_met || met || "Belum tersedia";

  const expertise =
    bidang_keahlian || "Belum tersedia";

  const imagePath = foto_profil || foto || "";

  const getImageUrl = (path) => {
    if (!path) return "";

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
    if (!assessorId) return;

    if (location.pathname === "/") {
      sessionStorage.setItem("simlsp-home-scroll-target", "assessor-section");
    }

    navigate(`/assessor/${assessorId}`);
  };

  return (
    <article
      onClick={handleDetail}
      className="group flex h-full w-full min-w-[330px] max-w-[400px] cursor-pointer flex-col overflow-hidden rounded-3xl border-2 border-[#CC6B27]/25 bg-white p-5 shadow-[0_18px_40px_-20px_rgba(7,30,61,0.14)] transition-all duration-300 hover:-translate-y-1 hover:border-[#CC6B27]/50 hover:shadow-[0_24px_48px_-20px_rgba(204,107,39,0.22)]"
    >
      {/* Bagian Atas: Avatar Kotak, Nama & Universitas Terakhir */}
      <div className="flex items-center gap-3.5 text-left">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-[#CC6B27]/25 bg-[#F5F6F8] shadow-sm transition-colors duration-300 group-hover:border-[#CC6B27]/45">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={displayName}
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display = "none";
                event.currentTarget.nextElementSibling?.classList.remove("hidden");
              }}
            />
          ) : null}

          <div
            className={`${
              imageUrl ? "hidden" : "flex"
            } h-full w-full items-center justify-center bg-[#CC6B27]/10`}
          >
            <span className="text-lg font-black tracking-tight text-[#071E3D]">
              {getInitial()}
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="break-words text-base font-black leading-snug text-[#071E3D]">
            {displayName}
          </h3>

          {university && (
            <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <GraduationCap size={13} className="shrink-0 text-[#CC6B27]" />
              <span className="break-words leading-snug">{university}</span>
            </p>
          )}
        </div>
      </div>

      <div className="my-4 border-t border-slate-100" />

      {/* Bagian Info: MET & Keahlian dalam 1 Box */}
      <div className="mt-auto grid grid-cols-2 divide-x divide-slate-200/80 rounded-xl bg-[#F5F6F8] py-3.5">
        <InfoColumn
          icon={<BadgeCheck size={16} />}
          label="Nomor MET"
          value={nomorMet}
        />

        <InfoColumn
          icon={<Award size={16} />}
          label="Keahlian"
          value={expertise}
        />
      </div>
    </article>
  );
}

function InfoColumn({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5 px-3.5 text-left">
      <div className="shrink-0 text-[#CC6B27]">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-xs font-semibold leading-5 text-[#071E3D]">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}