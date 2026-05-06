import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import {
  AlertCircle,
  BadgeCheck,
  BriefcaseBusiness,
  Calendar,
  ChevronRight,
  Download,
  Eraser,
  FileCheck2,
  FileText,
  Globe,
  GraduationCap,
  Hash,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  RefreshCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Upload,
  User,
  XCircle,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";
const WILAYAH_PUBLIC_BASE =
  "https://emsifa.github.io/api-wilayah-indonesia/api";

const api = axios.create({
  baseURL: API_BASE,
});

const publicWilayahApi = axios.create({
  baseURL: WILAYAH_PUBLIC_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const getItemId = (item) => {
  return String(
    item?.id ||
      item?.kode ||
      item?.id_provinsi ||
      item?.id_kota ||
      item?.id_kecamatan ||
      item?.id_kelurahan ||
      ""
  );
};

const getItemName = (item) => {
  return (
    item?.name ||
    item?.nama ||
    item?.nama_provinsi ||
    item?.nama_kota ||
    item?.nama_kecamatan ||
    item?.nama_kelurahan ||
    ""
  );
};

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

  const getNameFromList = (list, idOrName) => {
    if (!idOrName) return "-";

    const found = list.find((item) => {
      const itemId = getItemId(item);
      const itemName = getItemName(item);

      return (
        String(itemId) === String(idOrName) ||
        String(itemName || "").toLowerCase() ===
          String(idOrName || "").toLowerCase()
      );
    });

    return getItemName(found) || idOrName || "-";
  };

  const fetchWilayahWithFallback = async ({
    backendPath,
    publicPath,
    errorMessage,
  }) => {
    try {
      const res = await api.get(backendPath);
      return normalizeList(res.data);
    } catch (backendErr) {
      console.warn(
        `Backend wilayah gagal: ${backendPath}. Fallback ke API publik.`,
        backendErr?.response?.status || backendErr?.message
      );

      try {
        const publicRes = await publicWilayahApi.get(publicPath);
        return normalizeList(publicRes.data);
      } catch (publicErr) {
        console.error(errorMessage, publicErr);
        throw new Error(errorMessage);
      }
    }
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

      await resolveWilayah(profileData);
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

  const resolveWilayah = async (data) => {
    try {
      let provinsiNama = data.provinsi || data.provinsi_nama || "-";
      let kotaNama = data.kota || data.kota_nama || "-";
      let kecamatanNama = data.kecamatan || data.kecamatan_nama || "-";
      let kelurahanNama = data.kelurahan || data.kelurahan_nama || "-";

      const provinsiId = data.provinsi_id || data.id_provinsi || "";
      const kotaId = data.kota_id || data.id_kota || "";
      const kecamatanId = data.kecamatan_id || data.id_kecamatan || "";
      const kelurahanId = data.kelurahan_id || data.id_kelurahan || "";

      if (provinsiId) {
        const provinsiList = await fetchWilayahWithFallback({
          backendPath: "/asesi/wilayah/provinsi",
          publicPath: "/provinces.json",
          errorMessage: "Gagal memuat data provinsi.",
        });

        provinsiNama = getNameFromList(provinsiList, provinsiId);
      }

      if (provinsiId && kotaId) {
        const kotaList = await fetchWilayahWithFallback({
          backendPath: `/asesi/wilayah/kota/${provinsiId}`,
          publicPath: `/regencies/${provinsiId}.json`,
          errorMessage: "Gagal memuat data kota/kabupaten.",
        });

        kotaNama = getNameFromList(kotaList, kotaId);
      }

      if (kotaId && kecamatanId) {
        const kecamatanList = await fetchWilayahWithFallback({
          backendPath: `/asesi/wilayah/kecamatan/${kotaId}`,
          publicPath: `/districts/${kotaId}.json`,
          errorMessage: "Gagal memuat data kecamatan.",
        });

        kecamatanNama = getNameFromList(kecamatanList, kecamatanId);
      }

      if (kecamatanId && kelurahanId) {
        const kelurahanList = await fetchWilayahWithFallback({
          backendPath: `/asesi/wilayah/kelurahan/${kecamatanId}`,
          publicPath: `/villages/${kecamatanId}.json`,
          errorMessage: "Gagal memuat data kelurahan/desa.",
        });

        kelurahanNama = getNameFromList(kelurahanList, kelurahanId);
      }

      setWilayah({
        provinsi: provinsiNama || "-",
        kota: kotaNama || "-",
        kecamatan: kecamatanNama || "-",
        kelurahan: kelurahanNama || "-",
      });
    } catch (err) {
      console.error("Gagal resolve wilayah:", err);

      setWilayah({
        provinsi: data.provinsi || data.provinsi_nama || "-",
        kota: data.kota || data.kota_nama || "-",
        kecamatan: data.kecamatan || data.kecamatan_nama || "-",
        kelurahan: data.kelurahan || data.kelurahan_nama || "-",
      });
    }
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
    return resolveFileUrl(files.foto_profil) || getImageSrc(profile?.foto_profil);
  }, [files, profile]);

  const ttdUrl = useMemo(() => {
    return resolveFileUrl(files.ttd) || getImageSrc(profile?.ttd_path);
  }, [files, profile]);

  const dokumenList = useMemo(() => {
    return [
      {
        key: "pas_foto",
        label: "Pas Foto",
        value: resolveFileUrl(files.pas_foto) || getImageSrc(profile?.pas_foto),
      },
      {
        key: "ktp",
        label: "KTP",
        value: resolveFileUrl(files.ktp) || getImageSrc(profile?.ktp),
      },
      {
        key: "ijazah",
        label: "Ijazah",
        value: resolveFileUrl(files.ijazah) || getImageSrc(profile?.ijazah),
      },
      {
        key: "transkrip",
        label: "Transkrip",
        value:
          resolveFileUrl(files.transkrip) || getImageSrc(profile?.transkrip),
      },
      {
        key: "kk",
        label: "Kartu Keluarga",
        value: resolveFileUrl(files.kk) || getImageSrc(profile?.kk),
      },
      {
        key: "surat_kerja",
        label: "Surat Kerja",
        value:
          resolveFileUrl(files.surat_kerja) ||
          getImageSrc(profile?.surat_kerja),
      },
      {
        key: "portofolio",
        label: "Portofolio",
        value:
          resolveFileUrl(files.portofolio) || getImageSrc(profile?.portofolio),
      },
    ];
  }, [files, profile]);

  const totalDokumen = dokumenList.length;
  const dokumenTerisi = dokumenList.filter((item) => Boolean(item.value)).length;

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
                  Lihat ringkasan data diri, pendidikan, alamat, pekerjaan,
                  dokumen pendukung, dan kelola tanda tangan digital langsung
                  dari halaman ini.
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
                    Upload Dokumen
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
                    {dokumenTerisi}/{totalDokumen} dokumen pendukung tersedia.
                    Tanda tangan digital dapat dibuat langsung memakai canvas.
                  </p>

                  <div className="mt-auto pt-6 grid grid-cols-2 gap-3">
                    <HeroPill label="Role" value="Asesi" />
                    <HeroPill
                      label="Dokumen"
                      value={`${dokumenTerisi}/${totalDokumen}`}
                    />
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

            <MiniStat icon={<Hash size={22} />} label="NIK" value={profile.nik || "-"} />

            <MiniStat
              icon={<FileCheck2 size={22} />}
              label="Dokumen"
              value={`${dokumenTerisi}/${totalDokumen} Terisi`}
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

              <InfoBox label="Tahun Lulus">{profile.tahun_lulus || "-"}</InfoBox>
            </div>
          </Card>

          <Card title="Alamat" icon={<MapPin size={22} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <InfoBox label="Alamat Lengkap" className="md:col-span-2 xl:col-span-4">
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

          <section className="grid grid-cols-1 xl:grid-cols-[1fr_430px] gap-6 items-start">
            <Card title="Dokumen" icon={<FileText size={22} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {dokumenList.map((item) => (
                  <DocumentBox
                    key={item.key}
                    label={item.label}
                    url={item.value}
                  />
                ))}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate("/asesi/profile/dokumen")}
                  className="px-6 py-4 rounded-2xl bg-orange-500 hover:bg-[#071E3D] text-white font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <Upload size={17} />
                  Kelola Dokumen
                  <ChevronRight size={16} />
                </button>

                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="px-6 py-4 rounded-2xl bg-[#071E3D] hover:bg-orange-500 text-white font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {refreshing ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <RefreshCcw size={17} />
                  )}
                  Refresh
                </button>
              </div>
            </Card>

            <SignatureCard currentTtd={ttdUrl} onSaved={loadProfile} />
          </section>
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
            <InfoBox label="Nama Lengkap">{profile.nama_lengkap || "-"}</InfoBox>

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

function SignatureCard({ currentTtd, onSaved }) {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);

  const [drawing, setDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cacheKey, setCacheKey] = useState(Date.now());

  const displayedTtd = currentTtd
    ? `${currentTtd}${currentTtd.includes("?") ? "&" : "?"}v=${cacheKey}`
    : "";

  useEffect(() => {
    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;

    if (!canvas || !wrapper) return;

    const ratio = window.devicePixelRatio || 1;
    const width = wrapper.clientWidth;
    const height = 210;

    canvas.width = width * ratio;
    canvas.height = height * ratio;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#071E3D";

    setHasDrawn(false);
  };

  const getPoint = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    if (event.touches && event.touches[0]) {
      return {
        x: event.touches[0].clientX - rect.left,
        y: event.touches[0].clientY - rect.top,
      };
    }

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const startDrawing = (event) => {
    event.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const point = getPoint(event);

    setDrawing(true);
    setHasDrawn(true);

    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  };

  const draw = (event) => {
    if (!drawing) return;

    event.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const point = getPoint(event);

    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();

    ctx.clearRect(0, 0, rect.width, rect.height);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);

    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#071E3D";

    setHasDrawn(false);
  };

  const saveSignature = async () => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    if (!hasDrawn) {
      alert("Silakan buat tanda tangan baru di canvas terlebih dahulu.");
      return;
    }

    try {
      setSaving(true);

      const ttdBase64 = canvas.toDataURL("image/png");

      await api.put("/asesi/profile/upload-ttd", {
        ttd_base64: ttdBase64,
      });

      alert("Tanda tangan berhasil diperbarui.");

      clearCanvas();

      setCacheKey(Date.now());

      if (onSaved) {
        await onSaved();
      }

      setCacheKey(Date.now());
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Gagal menyimpan tanda tangan."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
          <Pencil size={22} />
        </div>

        <div>
          <h2 className="text-xl font-black text-[#071E3D]">
            Tanda Tangan Digital
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            Canvas TTD
          </p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {currentTtd ? (
          <div className="rounded-[24px] border border-emerald-100 bg-emerald-50 p-5">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                  TTD Tersimpan
                </p>
                <p className="text-sm font-black text-emerald-700 mt-1">
                  Tanda tangan sudah tersedia. Jika ingin mengganti, buat tanda
                  tangan baru di canvas lalu klik simpan.
                </p>
              </div>

              <BadgeCheck className="text-emerald-600" size={24} />
            </div>

            <div className="rounded-2xl bg-white border border-emerald-100 p-4 flex items-center justify-center min-h-[130px]">
              <img
                src={displayedTtd}
                alt="Tanda Tangan"
                className="max-h-[110px] object-contain"
              />
            </div>
          </div>
        ) : (
          <div className="rounded-[24px] border border-slate-100 bg-slate-50 p-5 flex gap-3 text-slate-500">
            <AlertCircle size={20} className="shrink-0 text-orange-500" />
            <p className="text-sm font-semibold leading-relaxed">
              Tanda tangan belum tersedia. Silakan tanda tangan di canvas, lalu
              klik simpan.
            </p>
          </div>
        )}

        <div>
          <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Canvas Tanda Tangan Baru
              </p>
              <p className="text-sm font-semibold text-slate-500 mt-1">
                Coret di area putih ini untuk mengganti tanda tangan lama.
              </p>
            </div>

            <button
              type="button"
              onClick={clearCanvas}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
            >
              <Eraser size={15} />
              Bersihkan
            </button>
          </div>

          <div
            ref={wrapperRef}
            className="rounded-[24px] overflow-hidden border-2 border-dashed border-slate-200 bg-white"
          >
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="block w-full cursor-crosshair touch-none"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={saveSignature}
          disabled={saving}
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {saving ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <Save size={17} />
          )}
          {saving ? "Menyimpan..." : "Simpan / Ganti Tanda Tangan"}
        </button>
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

function DocumentBox({ label, url }) {
  const ready = Boolean(url);

  return (
    <div
      className={`rounded-[24px] border p-5 ${
        ready
          ? "bg-emerald-50 border-emerald-100"
          : "bg-slate-50 border-slate-100"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className={`text-[10px] font-black uppercase tracking-widest mb-2 ${
              ready ? "text-emerald-600" : "text-slate-400"
            }`}
          >
            {label}
          </p>

          <p
            className={`text-sm font-black ${
              ready ? "text-emerald-700" : "text-slate-500"
            }`}
          >
            {ready ? "Dokumen tersedia" : "Belum diupload"}
          </p>
        </div>

        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
            ready
              ? "bg-white text-emerald-600"
              : "bg-white text-slate-300 border border-slate-100"
          }`}
        >
          {ready ? <BadgeCheck size={20} /> : <XCircle size={20} />}
        </div>
      </div>

      {ready && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs font-black uppercase tracking-widest text-[#071E3D] border border-white hover:bg-[#071E3D] hover:text-white transition-all"
        >
          <Download size={15} />
          Lihat File
        </a>
      )}
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