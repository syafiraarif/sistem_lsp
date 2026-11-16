
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Award,
  Building2,
  Mail,
  Briefcase,
  MapPin,
  Phone,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import axios from "axios";

const API_URL = "http://localhost:3000/api/public";

const EMPTY_PROFILE = {
  id: null,
  name: "Asesor LSP",
  competency: "Sertifikasi Kompetensi",
  institution: "LSP Teknologi Informasi",
  status: "Aktif",
  image: null,
  license: "-",
  email: null,
  no_hp: null,
  kota_domisili: null,
  provinsi_domisili: null,
  alamat_domisili: null,
  rt_domisili: null,
  rw_domisili: null,
  kecamatan_domisili: null,
  kelurahan_domisili: null,
  kode_pos_domisili: null,
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

  useEffect(() => {
    setImageError(false);
  }, [data.image]);

  const isActive =
    String(data.status || data.status_asesor || "").toLowerCase() === "aktif";

  const location = [data.kota_domisili, data.provinsi_domisili]
    .filter(Boolean)
    .join(", ");

  const addressParts = [
    data.alamat_domisili,
    data.rt_domisili ? `RT ${data.rt_domisili}` : null,
    data.rw_domisili ? `RW ${data.rw_domisili}` : null,
    data.kelurahan_domisili ? `Kelurahan ${data.kelurahan_domisili}` : null,
    data.kecamatan_domisili ? `Kecamatan ${data.kecamatan_domisili}` : null,
    data.kota_domisili,
    data.provinsi_domisili,
    data.kode_pos_domisili,
  ].filter(Boolean);

  const fullAddress = addressParts.join(", ");

  const skills = String(data.competency || "Asesor Kompetensi")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const getInitials = (name) => {
    const words = String(name || "Asesor")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (words.length > 1) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }

    return words[0]?.charAt(0).toUpperCase() || "A";
  };

  if (loading) {
    return (
      <div className="flex min-h-[65vh] flex-col items-center justify-center bg-[#F5F6F8]">
        <Loader2 className="mb-4 animate-spin text-[#CC6B27]" size={36} />
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#182D4A]/50">
          Memuat profil asesor
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center bg-[#F5F6F8] px-6">
        <div className="w-full max-w-md border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-4 text-red-400" size={42} />
          <h1 className="mb-2 text-xl font-bold text-[#071E3D]">
            Profil asesor tidak ditemukan
          </h1>
          <p className="mb-7 text-sm leading-relaxed text-slate-500">{error}</p>
          <button
            type="button"
            onClick={() => navigate("/explore-assessors")}
            className="inline-flex items-center gap-2 rounded-md bg-[#071E3D] px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#CC6B27]"
          >
            <ArrowLeft size={15} />
            Kembali ke Daftar Asesor
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F6F8] pb-20">
      <section className="bg-[#071E3D]">
        <div className="mx-auto max-w-7xl px-6 py-8 md:py-10">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-8 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/75 transition-colors hover:text-[#E58A4B]"
          >
            <ArrowLeft size={15} />
            Kembali
          </button>

          <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
            Profil Asesor
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/65">
            Informasi identitas, bidang keahlian, dan data profesional asesor
            yang terdaftar di SIMLSP.
          </p>
        </div>
        <div className="h-1 bg-[#CC6B27]" />
      </section>

      <section className="mx-auto max-w-7xl px-6 pt-8 md:pt-10">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
          <motion.aside
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="lg:col-span-4"
          >
            <div className="border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  Informasi Asesor
                </p>
                <span
                  className={`inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider ${
                    isActive ? "text-green-700" : "text-red-600"
                  }`}
                >
                </span>
              </div>

              <div className="p-6">
                <div className="mx-auto flex h-36 w-32 items-center justify-center overflow-hidden border border-slate-200 bg-[#F1F3F6]">
                  {data.image && !imageError ? (
                    <img
                      src={data.image}
                      alt={data.name}
                      className="h-full w-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <span className="text-4xl font-black text-[#071E3D]">
                      {getInitials(data.name)}
                    </span>
                  )}
                </div>

                <div className="mt-5 text-center">
                  <h2 className="text-xl font-black leading-snug text-[#071E3D]">
                    {data.name || "Asesor LSP"}
                  </h2>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Asesor Tersertifikasi
                  </p>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-5">
                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    Nomor Registrasi
                  </p>
                  <p className="mt-1 break-words text-sm font-bold text-[#071E3D]">
                    {data.license || data.no_reg_asesor || data.no_lisensi || "-"}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-100 bg-[#FAFAFB] px-6 py-5">
                <div className="space-y-5">
                  <ContactItem
                    icon={<Mail size={16} />}
                    label="Email Resmi"
                    value={data.email || "Belum tersedia"}
                  />
                  <ContactItem
                    icon={<Phone size={16} />}
                    label="Nomor Telepon"
                    value={data.no_hp || "Belum tersedia"}
                  />
                  <ContactItem
                    icon={<MapPin size={16} />}
                    label="Domisili"
                    value={location || "Belum tersedia"}
                  />
                </div>
              </div>
            </div>
          </motion.aside>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="space-y-6 lg:col-span-8"
          >
            <section className="border border-slate-200 bg-white shadow-sm">
              <SectionHeading
                icon={<Award size={18} />}
                title="Profil Profesional"
                description="Ringkasan informasi profesional asesor"
              />

              <div className="p-6 md:p-8">
                <p className="text-sm leading-7 text-slate-600 md:text-[15px]">
                  <span className="font-bold text-[#071E3D]">{data.name}</span>{" "}
                  merupakan asesor kompetensi yang terdaftar dalam sistem LSP.
                  Bidang keahlian yang dimiliki adalah{" "}
                  <span className="font-semibold text-[#CC6B27]">
                    {data.competency || "Sertifikasi Kompetensi"}
                  </span>
                  .
                </p>

                <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="border border-[#CC6B27]/20 bg-[#FBF5F0] p-5">
                    <div className="mb-5 flex h-10 w-10 items-center justify-center bg-[#CC6B27] text-white">
                      <Briefcase size={19} />
                    </div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                      Bidang Spesialisasi
                    </p>
                    <p className="mt-2 text-base font-bold leading-snug text-[#071E3D]">
                      {data.competency || "Asesor Kompetensi"}
                    </p>
                  </div>

                  <div className="border border-[#071E3D] bg-[#071E3D] p-5">
                    <div className="mb-5 flex h-10 w-10 items-center justify-center bg-white/10 text-[#E58A4B]">
                      <Building2 size={19} />
                    </div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/50">
                      Institusi / TUK
                    </p>
                    <p className="mt-2 text-base font-bold leading-snug text-white">
                      {data.institution || "LSP Teknologi Informasi"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="border border-slate-200 bg-white shadow-sm">
              <SectionHeading
                icon={<CheckCircle2 size={18} />}
                title="Skema yang Diampu"
                description="Bidang kompetensi yang dimiliki asesor"
                orange
              />

              <div className="flex flex-wrap gap-2 p-6 md:p-8">
                {skills.map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="inline-flex items-center gap-2 border border-[#CC6B27]/20 bg-[#FBF5F0] px-3 py-2 text-xs font-semibold text-[#071E3D]"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#CC6B27]" />
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            <section className="border border-slate-200 bg-white shadow-sm">
              <SectionHeading
                icon={<MapPin size={18} />}
                title="Alamat Domisili"
                description="Alamat yang tercatat pada data asesor"
              />

              <div className="p-6 md:p-8">
                <div className="border-l-[3px] border-[#CC6B27] bg-[#F5F6F8] px-5 py-4">
                  <p className="text-sm leading-7 text-slate-600">
                    {fullAddress || "Alamat domisili belum tersedia."}
                  </p>
                </div>
              </div>
            </section>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

function SectionHeading({ icon, title, description, orange = false }) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-200 bg-[#F8F9FB] px-6 py-4 md:px-8">
      <div
        className={`flex h-9 w-9 items-center justify-center text-white ${
          orange ? "bg-[#CC6B27]" : "bg-[#071E3D]"
        }`}
      >
        {icon}
      </div>
      <div>
        <h2 className="text-base font-bold text-[#071E3D]">{title}</h2>
        <p className="mt-0.5 text-[10px] text-slate-400">{description}</p>
      </div>
    </div>
  );
}

function ContactItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-white text-[#CC6B27]">
        {icon}
      </div>
      <div className="min-w-0 pt-0.5">
        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
          {label}
        </p>
        <p className="mt-1 break-words text-xs font-semibold leading-relaxed text-[#071E3D]">
          {value}
        </p>
      </div>
    </div>
  );
}
