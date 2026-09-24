import React, { useEffect, useMemo, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import {
  AlertCircle,
  BadgeCheck,
  BriefcaseBusiness,
  Camera,
  Eraser,
  FileSignature,
  GraduationCap,
  Hash,
  ImagePlus,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  PenLine,
  Phone,
  RefreshCcw,
  Save,
  ShieldCheck,
  Upload,
  UploadCloud,
  User,
  XCircle,
} from "lucide-react";
import { notifikasi } from "../../components/ui/notifikasi";

const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

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
  const sigRef = useRef(null);
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [files, setFiles] = useState({});
  const [wilayah, setWilayah] = useState({
    provinsi: "-",
    kota: "-",
    kecamatan: "-",
    kelurahan: "-",
  });

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [savingTTD, setSavingTTD] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(Date.now());

  const imageBase = API_BASE.replace(/\/api\/?$/, "");

  useEffect(() => {
    loadProfile();

    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, []);

  const getImageSrc = (path) => {
    if (!path) {
      return "";
    }

    if (String(path).startsWith("http")) {
      return path;
    }

    const clean = String(path).replace(/^\/+/, "");

    return `${imageBase}/${clean}`;
  };

  const resolveFileUrl = (path) => {
    if (!path) {
      return "";
    }

    if (String(path).startsWith("http")) {
      return path;
    }

    return getImageSrc(path);
  };

  const loadProfile = async ({
    showLoading = true,
    showSuccess = false,
  } = {}) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

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

      const profileData =
        profileRes.value?.data?.data || null;

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
        provinsi:
          profileData.provinsi ||
          profileData.provinsi_nama ||
          "-",
        kota:
          profileData.kota ||
          profileData.kota_nama ||
          "-",
        kecamatan:
          profileData.kecamatan ||
          profileData.kecamatan_nama ||
          "-",
        kelurahan:
          profileData.kelurahan ||
          profileData.kelurahan_nama ||
          "-",
      });

      setRefreshKey(Date.now());

      if (showSuccess) {
        await notifikasi.sukses(
          "Berhasil",
          "Data profile asesi berhasil diperbarui."
        );
      }
    } catch (err) {
      console.error("Gagal ambil profile:", err);

      await notifikasi.gagal(
        "Gagal Memuat Profile",
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Gagal memuat profile asesi."
      );

      setProfile(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setSelectedPhoto(null);

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoPreview("");

    await loadProfile({
      showLoading: false,
      showSuccess: true,
    });
  };

  const formatTanggal = (date) => {
    if (!date) {
      return "-";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "-";
    }

    return parsed.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const profilePhoto = useMemo(() => {
    return (
      photoPreview ||
      resolveFileUrl(files.foto_profil) ||
      getImageSrc(profile?.foto_profil)
    );
  }, [photoPreview, files, profile]);

  const ttdUrl = useMemo(() => {
    return (
      resolveFileUrl(files.ttd) ||
      resolveFileUrl(files.tanda_tangan) ||
      getImageSrc(profile?.ttd_path) ||
      getImageSrc(profile?.ttd)
    );
  }, [files, profile]);

  const handlePhotoSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      notifikasi.peringatan(
        "Format Foto Tidak Sesuai",
        "Foto profile harus berupa JPG, PNG, JPEG, atau WEBP."
      );
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      notifikasi.peringatan(
        "Ukuran Foto Terlalu Besar",
        "Ukuran foto profile maksimal 2 MB."
      );
      return;
    }

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setSelectedPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const clearSelectedPhoto = () => {
    setSelectedPhoto(null);

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoPreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadFotoProfile = async () => {
    if (!selectedPhoto) {
      await notifikasi.peringatan(
        "Foto Belum Dipilih",
        "Silakan pilih foto profile terlebih dahulu."
      );
      return;
    }

    try {
      setUploadingPhoto(true);

      const formData = new FormData();
      formData.append("foto_profil", selectedPhoto);

      await api.put(
        "/asesi/profile/upload-dokumen",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      clearSelectedPhoto();

      await loadProfile({
        showLoading: false,
        showSuccess: false,
      });

      await notifikasi.sukses(
        "Berhasil",
        "Foto profile berhasil diperbarui."
      );
    } catch (err) {
      console.error("Upload foto error:", err);

      await notifikasi.gagal(
        "Gagal Mengupload Foto",
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Gagal mengupload foto profile."
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  const saveTTD = async () => {
    if (!sigRef.current || sigRef.current.isEmpty()) {
      await notifikasi.peringatan(
        "Tanda Tangan Kosong",
        "Silakan buat tanda tangan terlebih dahulu."
      );
      return;
    }

    try {
      setSavingTTD(true);

      const ttdBase64 =
        sigRef.current.getCanvas().toDataURL("image/png");

      await api.put(
        "/asesi/profile/upload-ttd",
        {
          ttd_base64: ttdBase64,
        }
      );

      sigRef.current.clear();

      await loadProfile({
        showLoading: false,
        showSuccess: false,
      });

      await notifikasi.sukses(
        "Berhasil",
        "Tanda tangan berhasil disimpan."
      );
    } catch (err) {
      console.error("Simpan TTD error:", err);

      await notifikasi.gagal(
        "Gagal Menyimpan TTD",
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Gagal menyimpan tanda tangan."
      );
    } finally {
      setSavingTTD(false);
    }
  };

  const clearTTD = () => {
    if (sigRef.current) {
      sigRef.current.clear();
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen bg-[#FAFAFA]">
        <SidebarAsesi
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />

        <main className="flex flex-1 items-center justify-center p-4 md:p-6 lg:p-8">
          <div className="w-full max-w-md rounded-xl border border-[#071E3D]/10 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
              <AlertCircle size={30} />
            </div>

            <h2 className="text-[22px] font-black text-[#071E3D]">
              Profile Tidak Ditemukan
            </h2>

            <p className="mt-2 text-[13px] font-medium leading-6 text-[#182D4A]/65">
              Data profile belum tersedia atau gagal dimuat.
            </p>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-[#071E3D] px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-white transition-all hover:bg-[#CC6B27] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {refreshing ? (
                <Loader2
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <RefreshCcw size={15} />
              )}
              Coba Lagi
            </button>
          </div>
        </main>
      </div>
    );
  }

  const displayName =
    profile.nama_lengkap ||
    profile.nama ||
    profile.username ||
    "Asesi";

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <SidebarAsesi
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-[1500px] space-y-5">
          <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
            <div className="border-b border-[#071E3D]/10 px-5 py-5 md:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-[24px] font-black text-[#071E3D] md:text-[28px]">
                    Data Profile {displayName}
                  </h1>

                  <p className="mt-1 text-[13px] font-medium text-[#182D4A]/70">
                    Lihat data identitas, pendidikan, alamat,
                    pekerjaan, foto profil, dan tanda tangan digital.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      navigate("/asesi/profile/edit")
                    }
                    className="rounded-lg border border-[#CC6B27]/40 bg-white px-4 py-2.5 text-[12px] font-bold text-[#CC6B27] shadow-sm transition-all hover:border-[#CC6B27] hover:bg-[#CC6B27] hover:text-white"
                  >
                    <span className="flex items-center gap-2">
                      <Pencil size={15} />
                      Edit
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="rounded-lg border border-[#071E3D]/20 bg-white px-4 py-2.5 text-[12px] font-bold text-[#071E3D] shadow-sm transition-all hover:border-[#071E3D] hover:bg-[#071E3D] hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <span className="flex items-center justify-center gap-2">
                      {refreshing ? (
                        <Loader2
                          size={15}
                          className="animate-spin"
                        />
                      ) : (
                        <RefreshCcw size={15} />
                      )}
                      Refresh
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3 md:p-6">
              <ProfileStat
                icon={<User size={21} />}
                label="Nama Asesi"
                value={displayName}
              />

              <ProfileStat
                icon={<BadgeCheck size={21} />}
                label="Status Foto"
                value={
                  profilePhoto
                    ? "Sudah tersedia"
                    : "Belum tersedia"
                }
                tone={profilePhoto ? "green" : "orange"}
              />

              <ProfileStat
                icon={<ShieldCheck size={21} />}
                label="Tanda Tangan"
                value={
                  ttdUrl
                    ? "Sudah tersedia"
                    : "Belum dibuat"
                }
                tone={ttdUrl ? "green" : "orange"}
              />
            </div>
          </section>

          <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
              <div className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-5 py-3.5">
                <h2 className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-white">
                  <Camera
                    size={17}
                    className="text-[#CC6B27]"
                  />
                  Foto Profil
                </h2>
              </div>

              <div className="border-b border-[#071E3D]/10 bg-white px-5 py-3">
                <p className="text-[12px] font-medium text-[#182D4A]/60">
                  Foto identitas yang tersimpan pada profile asesi.
                </p>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-[190px_1fr] md:items-center">
                  <div className="relative h-[220px] overflow-hidden rounded-lg border border-[#071E3D]/10 bg-[#FAFAFA]">
                    {profilePhoto ? (
                      <img
                        src={`${profilePhoto}${
                          profilePhoto.includes("?")
                            ? "&"
                            : "?"
                        }t=${refreshKey}`}
                        alt="Foto Profil"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center p-5 text-center">
                        <div>
                          <User
                            size={38}
                            className="mx-auto mb-3 text-[#071E3D]/20"
                          />

                          <p className="text-[13px] font-bold text-[#071E3D]">
                            Belum Ada Foto
                          </p>

                          <p className="mt-1 text-[11px] font-medium text-[#182D4A]/60">
                            Foto profil belum tersedia.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="rounded-lg border border-[#071E3D]/10 bg-[#FAFAFA] p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#182D4A]/60">
                        Status Foto
                      </p>

                      <p className="mt-1.5 flex items-center gap-2 text-[13px] font-bold text-[#071E3D]">
                        {profilePhoto ? (
                          <BadgeCheck
                            size={15}
                            className="text-green-600"
                          />
                        ) : (
                          <XCircle
                            size={15}
                            className="text-[#CC6B27]"
                          />
                        )}

                        {profilePhoto
                          ? "Foto sudah tersedia"
                          : "Foto belum tersedia"}
                      </p>
                    </div>

                    <div className="rounded-lg border border-[#071E3D]/10 bg-[#FAFAFA] p-4">
                      <div className="flex items-start gap-3">
                        <UploadCloud
                          size={18}
                          className="mt-0.5 shrink-0 text-[#CC6B27]"
                        />

                        <div>
                          <p className="text-[12px] font-bold text-[#071E3D]">
                            Pengelolaan Foto
                          </p>

                          <p className="mt-1 text-[11px] font-medium leading-5 text-[#182D4A]/60">
                            Untuk mengganti foto profil, gunakan halaman
                            Edit Profile.
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate("/asesi/profile/edit")
                      }
                      className="rounded-lg bg-[#CC6B27] px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-white transition-all hover:bg-[#071E3D]"
                    >
                      Ganti Foto
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
              <div className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-5 py-3.5">
                <h2 className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-white">
                  <FileSignature
                    size={17}
                    className="text-[#CC6B27]"
                  />
                  Tanda Tangan Digital
                </h2>
              </div>

              <div className="border-b border-[#071E3D]/10 bg-white px-5 py-3">
                <p className="text-[12px] font-medium text-[#182D4A]/60">
                  Tanda tangan yang digunakan pada dokumen asesi.
                </p>
              </div>

              <div className="p-5">
                {ttdUrl ? (
                  <div className="rounded-lg border border-green-100 bg-green-50 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <BadgeCheck
                        size={16}
                        className="text-green-600"
                      />

                      <p className="text-[11px] font-bold uppercase tracking-wider text-green-600">
                        TTD Tersimpan
                      </p>
                    </div>

                    <div className="flex min-h-[185px] items-center justify-center rounded-lg border border-green-100 bg-white p-5">
                      <img
                        src={`${ttdUrl}${
                          ttdUrl.includes("?")
                            ? "&"
                            : "?"
                        }t=${refreshKey}`}
                        alt="Tanda Tangan"
                        className="max-h-[145px] max-w-full object-contain"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-[185px] items-center justify-center rounded-lg border border-dashed border-[#CC6B27]/30 bg-[#CC6B27]/5 p-5 text-center">
                    <div>
                      <PenLine
                        size={30}
                        className="mx-auto mb-3 text-[#CC6B27]"
                      />

                      <p className="text-[13px] font-bold text-[#071E3D]">
                        Tanda Tangan Belum Tersedia
                      </p>

                      <p className="mt-1 text-[11px] font-medium text-[#182D4A]/60">
                        Buat tanda tangan melalui halaman Edit Profile.
                      </p>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() =>
                    navigate("/asesi/profile/edit")
                  }
                  className="mt-4 w-full rounded-lg bg-[#071E3D] px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-white transition-all hover:bg-[#CC6B27]"
                >
                  {ttdUrl
                    ? "Ganti Tanda Tangan"
                    : "Buat Tanda Tangan"}
                </button>
              </div>
            </section>
          </section>

          <ProfileSection
            title="Informasi Identitas"
            subtitle="Data identitas pribadi yang tersimpan pada profile."
            icon={<User size={17} />}
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <InfoBox label="Nama Lengkap">
                {profile.nama_lengkap || "-"}
              </InfoBox>

              <InfoBox label="NIK">
                {profile.nik || "-"}
              </InfoBox>

              <InfoBox label="Jenis Kelamin">
                {formatJenisKelamin(profile.jenis_kelamin)}
              </InfoBox>

              <InfoBox label="Kebangsaan">
                {profile.kebangsaan || "-"}
              </InfoBox>

              <InfoBox label="Tempat Lahir">
                {profile.tempat_lahir || "-"}
              </InfoBox>

              <InfoBox label="Tanggal Lahir">
                {formatTanggal(profile.tanggal_lahir)}
              </InfoBox>
            </div>
          </ProfileSection>

          <ProfileSection
            title="Pendidikan"
            subtitle="Informasi pendidikan terakhir dan institusi asal."
            icon={<GraduationCap size={17} />}
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <InfoBox label="Pendidikan Terakhir">
                {profile.pendidikan_terakhir || "-"}
              </InfoBox>

              <InfoBox label="Universitas / Sekolah">
                {profile.universitas ||
                  profile.institut_asal ||
                  "-"}
              </InfoBox>

              <InfoBox label="Jurusan">
                {profile.jurusan || "-"}
              </InfoBox>

              <InfoBox label="Tahun Lulus">
                {profile.tahun_lulus || "-"}
              </InfoBox>
            </div>
          </ProfileSection>

          <ProfileSection
            title="Alamat"
            subtitle="Alamat tempat tinggal sesuai data profile asesi."
            icon={<MapPin size={17} />}
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <InfoBox label="Provinsi">
                {wilayah.provinsi || "-"}
              </InfoBox>

              <InfoBox label="Kota / Kabupaten">
                {wilayah.kota || "-"}
              </InfoBox>

              <InfoBox label="Kecamatan">
                {wilayah.kecamatan || "-"}
              </InfoBox>

              <InfoBox label="Kelurahan / Desa">
                {wilayah.kelurahan || "-"}
              </InfoBox>

              <InfoBox label="RT">
                {profile.rt || "-"}
              </InfoBox>

              <InfoBox label="RW">
                {profile.rw || "-"}
              </InfoBox>

              <InfoBox label="Kode Pos">
                {profile.kode_pos || "-"}
              </InfoBox>

              <InfoBox
                label="Alamat Lengkap"
                className="md:col-span-2 xl:col-span-4"
              >
                {profile.alamat || "-"}
              </InfoBox>
            </div>
          </ProfileSection>

          <ProfileSection
            title="Pekerjaan"
            subtitle="Informasi pekerjaan atau aktivitas profesional asesi."
            icon={<BriefcaseBusiness size={17} />}
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              <InfoBox label="Pekerjaan">
                {profile.pekerjaan || "-"}
              </InfoBox>

              <InfoBox label="Jabatan">
                {profile.jabatan || "-"}
              </InfoBox>

              <InfoBox label="Nama Perusahaan">
                {profile.nama_perusahaan || "-"}
              </InfoBox>

              <InfoBox label="Telepon Perusahaan">
                <span className="inline-flex items-center gap-2">
                  <Phone
                    size={14}
                    className="text-[#CC6B27]"
                  />
                  {profile.telp_perusahaan || "-"}
                </span>
              </InfoBox>

              <InfoBox label="Fax Perusahaan">
                {profile.fax_perusahaan || "-"}
              </InfoBox>

              <InfoBox label="Email Perusahaan">
                <span className="inline-flex items-center gap-2">
                  <Mail
                    size={14}
                    className="text-[#CC6B27]"
                  />
                  {profile.email_perusahaan || "-"}
                </span>
              </InfoBox>

              <InfoBox
                label="Alamat Perusahaan"
                className="md:col-span-2 xl:col-span-3"
              >
                {profile.alamat_perusahaan || "-"}
              </InfoBox>
            </div>
          </ProfileSection>
        </div>
      </main>
    </div>
  );
}

function ProfileStat({
  icon,
  label,
  value,
  tone = "orange",
}) {
  const tones = {
    orange: {
      icon: "bg-[#CC6B27]/10 text-[#CC6B27]",
      value: "text-[#071E3D]",
    },
    green: {
      icon: "bg-green-50 text-green-600",
      value: "text-green-600",
    },
  };

  const current = tones[tone] || tones.orange;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#071E3D]/10 bg-white p-4 shadow-sm">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${current.icon}`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#182D4A]/60">
          {label}
        </p>

        <p
          className={`mt-1 truncate text-[15px] font-black ${current.value}`}
        >
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

function ProfileSection({
  title,
  subtitle,
  icon,
  children,
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
      <div className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-5 py-3.5 md:px-6">
        <h2 className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-white">
          <span className="text-[#CC6B27]">
            {icon}
          </span>
          {title}
        </h2>
      </div>

      <div className="border-b border-[#071E3D]/10 bg-white px-5 py-3 md:px-6">
        <p className="text-[12px] font-medium text-[#182D4A]/60">
          {subtitle}
        </p>
      </div>

      <div className="p-5 md:p-6">
        {children}
      </div>
    </section>
  );
}

function InfoBox({
  label,
  children,
  className = "",
}) {
  return (
    <div
      className={`rounded-lg border border-[#071E3D]/10 bg-[#FAFAFA] p-4 ${className}`}
    >
      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#182D4A]/60">
        {label}
      </p>

      <div className="text-[13px] font-bold leading-5 text-[#071E3D]">
        {children}
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
      <div className="flex items-center gap-4 rounded-xl border border-[#071E3D]/10 bg-white p-8 shadow-sm">
        <Loader2
          size={26}
          className="animate-spin text-[#CC6B27]"
        />

        <div>
          <h2 className="text-[15px] font-black text-[#071E3D]">
            Memuat Profile
          </h2>

          <p className="mt-1 text-[11px] font-medium text-[#182D4A]/60">
            Mohon tunggu sebentar...
          </p>
        </div>
      </div>
    </div>
  );
}

function formatJenisKelamin(value) {
  if (!value) {
    return "-";
  }

  const lower = String(value).toLowerCase();

  if (lower === "laki-laki") {
    return "Laki-laki";
  }

  if (lower === "perempuan") {
    return "Perempuan";
  }

  return value;
}