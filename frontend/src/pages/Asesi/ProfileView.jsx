// frontend/src/pages/asesi/ProfileView.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import {
  AlertCircle,
  BadgeCheck,
  BriefcaseBusiness,
  ChevronRight,
  Globe,
  GraduationCap,
  Hash,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Upload,
  User,
  XCircle,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

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

export default function ProfileView() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [files, setFiles] = useState({});
  const [wilayah, setWilayah] = useState({
    provinsi: "-",
    kota: "-",
    kecamatan: "-",
    kelurahan: "-",
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState("");

  const imageBase = API_BASE.replace("/api", "");

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getImageSrc = (path) => {
    if (!path) return "";
    if (String(path).startsWith("http")) return path;
    return `${imageBase}/${path}`;
  };

  const resolveFileUrl = (path) => {
    if (!path) return "";
    if (String(path).startsWith("http")) return path;
    return getImageSrc(path);
  };

  const loadProfile = async () => {
    try {
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const [profileRes, filesRes] = await Promise.allSettled([
        api.get("/asesi/profile"),
        api.get("/asesi/profile/files"),
      ]);

      if (profileRes.status !== "fulfilled") {
        throw profileRes.reason;
      }

      const profileData = profileRes.value?.data?.data || null;

      if (!profileData) {
        throw new Error("Profil asesi tidak ditemukan.");
      }

      setProfile(profileData);

      if (filesRes.status === "fulfilled") {
        setFiles(filesRes.value?.data?.data || {});
      } else {
        setFiles({});
      }

      setWilayah({
        provinsi: profileData.provinsi || profileData.provinsi_nama || "-",
        kota: profileData.kota || profileData.kota_nama || "-",
        kecamatan:
          profileData.kecamatan || profileData.kecamatan_nama || "-",
        kelurahan:
          profileData.kelurahan || profileData.kelurahan_nama || "-",
      });
    } catch (err) {
      console.error("Gagal ambil profile:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Gagal memuat profile."
      );

      setProfile(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
  };

  const formatTanggal = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "-";

    return parsed.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const profilePhoto = useMemo(() => {
    return (
      resolveFileUrl(files.foto_profil) || getImageSrc(profile?.foto_profil)
    );
  }, [files, profile]);

  const ttdUrl = useMemo(() => {
    return (
      resolveFileUrl(files.ttd) ||
      resolveFileUrl(files.tanda_tangan) ||
      getImageSrc(profile?.ttd_path) ||
      getImageSrc(profile?.ttd)
    );
  }, [files, profile]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex">
        <SidebarAsesi isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center">
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-10 text-center max-w-md">
            <div className="w-20 h-20 rounded-[28px] bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-5">
              <AlertCircle size={38} />
            </div>

            <h2 className="text-2xl font-black text-[#071E3D] mb-2">
              Profile Tidak Ditemukan
            </h2>

            <p className="text-slate-500 font-medium mb-6">
              {error || "Data profile belum tersedia atau gagal dimuat."}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-6 py-4 rounded-2xl bg-[#071E3D] hover:bg-orange-500 text-white font-black text-xs uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2"
              >
                {refreshing ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <RefreshCcw size={17} />
                )}
                Coba Lagi
              </button>

              <button
                onClick={() => navigate("/asesi/profile/edit")}
                className="px-6 py-4 rounded-2xl bg-orange-500 hover:bg-[#071E3D] text-white font-black text-xs uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2"
              >
                Lengkapi Profile
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <SidebarAsesi isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300 overflow-x-hidden">
        <div className="w-full max-w-[1500px] mx-auto space-y-6">
          <section className="relative overflow-hidden rounded-[36px] border border-slate-100 bg-white shadow-sm">
            <div className="absolute top-0 right-0 w-[430px] h-[430px] bg-orange-500/10 rounded-full blur-[110px]" />
            <div className="absolute -bottom-24 -left-24 w-[380px] h-[380px] bg-[#071E3D]/5 rounded-full blur-[100px]" />

            <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6 p-6 lg:p-8">
              <div className="flex flex-col justify-center">
                <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                  <ShieldCheck size={15} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                    Profile Asesi
                  </span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-black leading-tight text-[#071E3D]">
                  Profile
                  <br />
                  <span className="text-orange-500">Saya</span>
                </h1>

                <p className="mt-5 max-w-2xl text-base lg:text-lg font-medium leading-relaxed text-slate-500">
                  Lihat ringkasan data diri, pendidikan, alamat, pekerjaan, dan
                  status tanda tangan digital dari halaman profile.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/asesi/profile/edit")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
                  >
                    <Pencil size={17} />
                    Edit Profile
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/asesi/profile/dokumen")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-7 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                  >
                    <Upload size={17} />
                    Kelola Dokumen & TTD
                  </button>

                  <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-7 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-orange-500 hover:text-white disabled:opacity-60"
                  >
                    {refreshing ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <RefreshCcw size={17} />
                    )}
                    Refresh
                  </button>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[32px] bg-[#071E3D] p-6 text-white shadow-2xl shadow-[#071E3D]/15">
                <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />

                <div className="relative z-10 flex flex-col h-full">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-orange-400">
                    <Sparkles size={28} />
                  </div>

                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/50">
                    Ringkasan Profile
                  </p>

                  <h2 className="text-2xl font-black leading-tight">
                    {profile.nama_lengkap || "Asesi"}
                  </h2>

                  <p className="mt-4 text-sm font-medium leading-relaxed text-white/60">
                    Status tanda tangan digital:{" "}
                    {ttdUrl ? "sudah tersedia" : "belum dibuat"}.
                  </p>

                  <div className="mt-auto pt-6 grid grid-cols-2 gap-3">
                    <HeroPill label="Role" value="Asesi" />
                    <HeroPill label="TTD" value={ttdUrl ? "Ada" : "Belum"} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {error && <ErrorAlert message={error} onRetry={handleRefresh} />}

          <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <MiniStat
              icon={<User size={22} />}
              label="Nama Lengkap"
              value={profile.nama_lengkap || "-"}
            />

            <MiniStat
              icon={<Hash size={22} />}
              label="NIK"
              value={profile.nik || "-"}
            />

            <MiniStat
              icon={ttdUrl ? <BadgeCheck size={22} /> : <XCircle size={22} />}
              label="Status TTD"
              value={ttdUrl ? "Sudah Tersedia" : "Belum Dibuat"}
            />
          </section>

          <DataDiriCard
            profile={profile}
            profilePhoto={profilePhoto}
            ttdUrl={ttdUrl}
            formatTanggal={formatTanggal}
          />

          <Card title="Pendidikan" icon={<GraduationCap size={22} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <InfoBox label="Pendidikan Terakhir">
                {profile.pendidikan_terakhir || "-"}
              </InfoBox>

              <InfoBox label="Universitas">
                {profile.universitas || "-"}
              </InfoBox>

              <InfoBox label="Jurusan">{profile.jurusan || "-"}</InfoBox>

              <InfoBox label="Tahun Lulus">
                {profile.tahun_lulus || "-"}
              </InfoBox>
            </div>
          </Card>

          <Card title="Alamat" icon={<MapPin size={22} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <InfoBox
                label="Alamat Lengkap"
                className="md:col-span-2 xl:col-span-4"
              >
                {profile.alamat || "-"}
              </InfoBox>

              <InfoBox label="RT / RW">
                {(profile.rt || "-") + " / " + (profile.rw || "-")}
              </InfoBox>

              <InfoBox label="Kode Pos">{profile.kode_pos || "-"}</InfoBox>

              <InfoBox label="Provinsi">{wilayah.provinsi || "-"}</InfoBox>

              <InfoBox label="Kota/Kabupaten">{wilayah.kota || "-"}</InfoBox>

              <InfoBox label="Kecamatan">{wilayah.kecamatan || "-"}</InfoBox>

              <InfoBox label="Kelurahan/Desa">
                {wilayah.kelurahan || "-"}
              </InfoBox>
            </div>
          </Card>

          <Card title="Pekerjaan" icon={<BriefcaseBusiness size={22} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <InfoBox label="Pekerjaan">{profile.pekerjaan || "-"}</InfoBox>

              <InfoBox label="Jabatan">{profile.jabatan || "-"}</InfoBox>

              <InfoBox label="Nama Perusahaan">
                {profile.nama_perusahaan || "-"}
              </InfoBox>

              <InfoBox label="Telepon Perusahaan">
                <span className="inline-flex items-center gap-2">
                  <Phone size={15} className="text-orange-500" />
                  {profile.telp_perusahaan || "-"}
                </span>
              </InfoBox>

              <InfoBox label="Fax Perusahaan">
                {profile.fax_perusahaan || "-"}
              </InfoBox>

              <InfoBox label="Email Perusahaan">
                <span className="inline-flex items-center gap-2">
                  <Mail size={15} className="text-orange-500" />
                  {profile.email_perusahaan || "-"}
                </span>
              </InfoBox>

              <InfoBox label="Alamat Perusahaan" className="xl:col-span-3">
                {profile.alamat_perusahaan || "-"}
              </InfoBox>
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/asesi/profile/dokumen")}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-orange-500 hover:bg-[#071E3D] text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Upload size={17} />
              Kelola Dokumen & TTD
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function DataDiriCard({ profile, profilePhoto, ttdUrl, formatTanggal }) {
  return (
    <section className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
          <User size={22} />
        </div>

        <div>
          <h2 className="text-xl font-black text-[#071E3D]">Data Diri</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            Detail Profile
          </p>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 xl:grid-cols-[250px_1fr] gap-5 items-start">
          <div className="relative overflow-hidden rounded-[28px] bg-[#071E3D] p-5 flex items-center justify-center min-h-[245px]">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-orange-500/20 blur-3xl" />
            <div className="absolute -left-20 -bottom-20 h-44 w-44 rounded-full bg-white/10 blur-3xl" />

            <div className="relative z-10 flex h-36 w-36 items-center justify-center rounded-[34px] border border-white/10 bg-white/10 p-2">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Foto Profil"
                  className="h-full w-full rounded-[28px] object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-[28px] bg-white/10 text-white/50">
                  <User size={46} />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <InfoBox label="Nama Lengkap">
              {profile.nama_lengkap || "-"}
            </InfoBox>

            <InfoBox label="NIK">{profile.nik || "-"}</InfoBox>

            <InfoBox label="Jenis Kelamin">
              {formatJenisKelamin(profile.jenis_kelamin)}
            </InfoBox>

            <InfoBox label="Tempat / Tanggal Lahir">
              {`${profile.tempat_lahir || "-"} / ${formatTanggal(
                profile.tanggal_lahir
              )}`}
            </InfoBox>

            <InfoBox label="Kebangsaan">
              <span className="inline-flex items-center gap-2">
                <Globe size={15} className="text-orange-500" />
                {profile.kebangsaan || "-"}
              </span>
            </InfoBox>

            <InfoBox label="Status TTD">
              <span
                className={`inline-flex items-center gap-2 ${
                  ttdUrl ? "text-emerald-600" : "text-slate-500"
                }`}
              >
                {ttdUrl ? <BadgeCheck size={16} /> : <XCircle size={16} />}
                {ttdUrl ? "Sudah tersedia" : "Belum dibuat"}
              </span>
            </InfoBox>
          </div>
        </div>
      </div>
    </section>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-5">
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl p-10 text-center max-w-sm w-full">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#071E3D] flex items-center justify-center mb-5">
          <Loader2 className="animate-spin text-white" size={34} />
        </div>

        <h2 className="text-[#071E3D] font-black text-xl">Memuat Profile</h2>

        <p className="text-slate-500 text-sm mt-2 font-medium">
          Mengambil data profile asesi.
        </p>
      </div>
    </div>
  );
}

function ErrorAlert({ message, onRetry }) {
  return (
    <div className="rounded-[24px] border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-red-600">
      <div className="flex items-center gap-3">
        <AlertCircle size={20} className="shrink-0" />
        <span>{message}</span>
      </div>

      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-red-600 border border-red-100 hover:bg-red-100"
      >
        <RefreshCcw size={14} />
        Coba Lagi
      </button>
    </div>
  );
}

function Card({ title, icon, children }) {
  return (
    <section className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
          {icon}
        </div>

        <div>
          <h2 className="text-xl font-black text-[#071E3D]">{title}</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            Detail Profile
          </p>
        </div>
      </div>

      <div className="p-6">{children}</div>
    </section>
  );
}

function InfoBox({ label, children, className = "" }) {
  return (
    <div
      className={`rounded-[24px] bg-slate-50/70 border border-slate-100 p-5 ${className}`}
    >
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
        {label}
      </p>

      <div className="text-sm font-black text-[#071E3D] leading-relaxed break-words">
        {children}
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value }) {
  return (
    <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {label}
        </p>
        <p className="text-[#071E3D] font-black mt-1 truncate">{value}</p>
      </div>
    </div>
  );
}

function HeroPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
      <p className="text-[9px] font-black uppercase tracking-widest text-white/40">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function formatJenisKelamin(value) {
  if (!value) return "-";

  if (value === "laki-laki") return "Laki-laki";
  if (value === "perempuan") return "Perempuan";

  return value;
}