import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Mail,
  MapPin,
  Loader2,
  AlertCircle,
} from "lucide-react";
import axios from "axios";

const API_URL = "http://localhost:3000/api/public";
const ASSET_BASE = API_URL.replace(/\/api\/public\/?$/, "");

const EMPTY_PROFILE = {
  id: null,
  name: "Asesor LSP",
  competency: "Sertifikasi Kompetensi",
  institution: "LSP Teknologi Informasi",
  status: "Aktif",
  image: null,
  license: "-",
  email: null,
  kota_domisili: null,
  provinsi_domisili: null,
};

export default function AssessorProfile() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { slug } = useParams();

  const [data, setData] = useState({ ...EMPTY_PROFILE, ...(state || {}) });
  const [loading, setLoading] = useState(Boolean(slug));
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    let isMounted = true;

    const fetchDetail = async () => {
      if (!slug) {
        setLoading(false);
        setError("ID asesor tidak ditemukan.");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${API_URL}/asesor/${slug}`);

        if (!isMounted) return;

        if (response.data?.success && response.data?.data) {
          setData({ ...EMPTY_PROFILE, ...response.data.data });
        } else {
          setError("Detail asesor tidak ditemukan.");
        }
      } catch (err) {
        console.error("Gagal mengambil detail asesor:", err);

        if (isMounted) {
          setError("Detail asesor tidak dapat dimuat. Silakan coba kembali.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const rawImage = data.image || data.foto_profil || data.foto || "";
  const imageUrl = !rawImage
    ? ""
    : /^(https?:\/\/|data:)/i.test(String(rawImage))
    ? String(rawImage)
    : `${ASSET_BASE}/${String(rawImage).replace(/^\/+/, "")}`;

  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  const displayName = data.nama_lengkap || data.name || data.nama || "Asesor LSP";
  const nomorMet =
    data.license || data.no_reg_asesor || data.no_met || data.met || "-";
  const competencyText =
    data.bidang_keahlian || data.competency || "Sertifikasi Kompetensi";
  const institutionText =
    data.institut_asal || data.institution || "LSP Teknologi Informasi";

  const isActive =
    String(data.status || data.status_asesor || "aktif").toLowerCase() ===
    "aktif";

  const wilayah = [data.kota_domisili, data.provinsi_domisili]
    .filter(Boolean)
    .join(", ");

  const skills = String(competencyText)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const getInitials = (name) => {
    const words = String(name || "Asesor")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }

    return words[0]?.charAt(0).toUpperCase() || "A";
  };

  if (loading) {
    return (
      <div className="flex min-h-[65vh] flex-col items-center justify-center bg-slate-50/70">
        <Loader2 className="mb-3 animate-spin text-[#CC6B27]" size={36} />
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
          Memuat profil asesor
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center bg-slate-50/70 px-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-4 text-red-400" size={40} />
          <h1 className="mb-2 text-lg font-black text-[#071E3D]">
            Profil asesor tidak ditemukan
          </h1>
          <p className="mb-6 text-sm leading-relaxed text-slate-500">{error}</p>
          <button
            type="button"
            onClick={() => navigate("/explore-assessors")}
            className="inline-flex items-center gap-2 rounded-xl bg-[#071E3D] px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#CC6B27]"
          >
            <ArrowLeft size={15} />
            Kembali ke Direktori Asesor
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50/70 pb-20 pt-8">
      <div className="pointer-events-none absolute left-0 top-0 -z-10 h-[320px] w-full bg-gradient-to-b from-white to-transparent" />

      <div className="mx-auto max-w-5xl px-6">
        {/* Tombol Kembali Ringkas */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="group mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-[11px] font-bold text-[#071E3D] shadow-2xs transition-all hover:border-[#CC6B27]/40 hover:text-[#CC6B27]"
        >
          <ArrowLeft
            size={14}
            className="transition-transform group-hover:-translate-x-0.5"
          />
          Kembali
        </button>

        {/* Kartu Profil Utama yang Ringkas & Proporsional */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm"
        >
          {/* Header Identitas Asesor */}
          <div className="flex flex-col gap-5 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-[#CC6B27]/25 bg-[#F5F6F8]">
                {imageUrl && !imageError ? (
                  <img
                    src={imageUrl}
                    alt={displayName}
                    className="h-full w-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <span className="text-2xl font-black text-[#071E3D]">
                    {getInitials(displayName)}
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#CC6B27]">
                  Profil Asesor Kompetensi
                </p>
                <h1 className="mt-1 break-words text-xl font-black leading-snug text-[#071E3D] sm:text-2xl">
                  {displayName}
                </h1>
                {wilayah && (
                  <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <MapPin size={13} className="shrink-0 text-[#CC6B27]" />
                    {wilayah}
                  </p>
                )}
              </div>
            </div>

            <span
              className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider ${
                isActive
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border border-slate-200 bg-slate-100 text-slate-500"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isActive ? "bg-emerald-500" : "bg-slate-400"
                }`}
              />
              {isActive ? "Asesor Terverifikasi" : "Nonaktif"}
            </span>
          </div>

          {/* Informasi Kunci untuk Publik */}
          <div className="space-y-6 p-6 sm:p-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <InfoTile
                icon={<BadgeCheck size={17} />}
                label="Nomor Registrasi (MET)"
                value={nomorMet}
              />
              <InfoTile
                icon={<Building2 size={17} />}
                label="Institusi / Afiliasi"
                value={institutionText}
              />
              <InfoTile
                icon={<Mail size={17} />}
                label="Kontak Resmi"
                value={data.email || "Tersedia melalui LSP"}
              />
            </div>

            {/* Bidang Keahlian / Skema yang Diampu */}
            <div className="rounded-2xl border border-slate-100 bg-[#F8F9FB] p-5">
              <div className="flex items-center gap-2 text-[#071E3D]">
                <Award size={16} className="text-[#CC6B27]" />
                <h2 className="text-xs font-black uppercase tracking-[0.14em]">
                  Bidang Keahlian & Kompetensi
                </h2>
              </div>

              <div className="mt-3.5 flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#CC6B27]/20 bg-white px-3 py-1.5 text-xs font-semibold text-[#071E3D] shadow-2xs"
                  >
                    <CheckCircle2 size={13} className="text-[#CC6B27]" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

function InfoTile({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-[#F8F9FB] p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#CC6B27]/10 text-[#CC6B27]">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
          {label}
        </p>
        <p className="mt-1 break-words text-xs font-bold leading-5 text-[#071E3D]">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}