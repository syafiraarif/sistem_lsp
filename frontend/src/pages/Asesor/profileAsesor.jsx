// frontend/src/pages/asesor/ProfileAsesor.jsx

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarAsesor from "../../components/sidebar/SidebarAsesor";
import {
  BadgeCheck,
  Camera,
  ChevronRight,
  FileSignature,
  IdCard,
  ImagePlus,
  Loader2,
  MapPin,
  PenLine,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  User,
  UserRoundCheck,
  XCircle,
} from "lucide-react";
import api from "../../services/api";

const BASE_URL = "http://localhost:3000";

const initialProfile = {
  nik: "",
  gelar_depan: "",
  nama_lengkap: "",
  gelar_belakang: "",
  jenis_kelamin: "",
  tempat_lahir: "",
  tanggal_lahir: "",
  kebangsaan: "",
  pendidikan_terakhir: "",
  tahun_lulus: "",
  institut_asal: "",
  alamat: "",
  rt: "",
  rw: "",
  provinsi: "",
  kota: "",
  kecamatan: "",
  kelurahan: "",
  kode_pos: "",
  bidang_keahlian: "",
  no_reg_asesor: "",
  no_lisensi: "",
  masa_berlaku: "",
  status_asesor: "",
  ttd_path: "",
  foto_profil: "",
};

export default function ProfileAsesor() {
  const navigate = useNavigate();

  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(initialProfile);

  const [fotoProfil, setFotoProfil] = useState(null);
  const [previewFoto, setPreviewFoto] = useState("");
  const [previewTtd, setPreviewTtd] = useState("");

  const [isEditingTtd, setIsEditingTtd] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState("");
  const [error, setError] = useState("");

  const getFileUrl = (filePath) => {
    if (!filePath) return "";

    const cleanPath = filePath.replace(/\\/g, "/");

    if (cleanPath.startsWith("http")) {
      return cleanPath;
    }

    return `${BASE_URL}/${cleanPath}`;
  };

  const formatDateForInput = (dateValue) => {
    if (!dateValue) return "";
    return String(dateValue).slice(0, 10);
  };

  const setupSignatureCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;

    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;

    const ctx = canvas.getContext("2d");

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#071E3D";
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      setPesan("");

      const res = await api.get("/asesor/profile");
      const data = res.data?.data || {};

      setProfile({
        ...initialProfile,
        ...data,
        tanggal_lahir: formatDateForInput(data.tanggal_lahir),
        masa_berlaku: formatDateForInput(data.masa_berlaku),
        tahun_lulus: data.tahun_lulus || "",
      });

      const fotoUrl = getFileUrl(data.foto_profil);
      const ttdUrl = getFileUrl(data.ttd_path);

      setPreviewFoto(fotoUrl);
      setPreviewTtd(ttdUrl);
      setIsEditingTtd(!ttdUrl);
      setHasSignature(false);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Gagal mengambil data profil asesor"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (isEditingTtd) {
      setTimeout(setupSignatureCanvas, 50);
    }
  }, [isEditingTtd]);

  useEffect(() => {
    const handleResize = () => {
      if (isEditingTtd) {
        setupSignatureCanvas();
        setHasSignature(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isEditingTtd]);

  const getCanvasPoint = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const startDrawing = (event) => {
    event.preventDefault();

    const point = getCanvasPoint(event);
    isDrawingRef.current = true;
    lastPointRef.current = point;
  };

  const drawSignature = (event) => {
    if (!isDrawingRef.current) return;

    event.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const currentPoint = getCanvasPoint(event);
    const lastPoint = lastPointRef.current;

    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(currentPoint.x, currentPoint.y);
    ctx.stroke();

    lastPointRef.current = currentPoint;
    setHasSignature(true);
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearSignature = () => {
    setupSignatureCanvas();
    setHasSignature(false);
  };

  const handleEditTtd = () => {
    setIsEditingTtd(true);
    setHasSignature(false);
    setTimeout(setupSignatureCanvas, 50);
  };

  const handleCancelEditTtd = () => {
    if (previewTtd) {
      setIsEditingTtd(false);
      setHasSignature(false);
      return;
    }

    clearSignature();
  };

  const canvasToBlob = () => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;

      if (!canvas) {
        resolve(null);
        return;
      }

      canvas.toBlob((blob) => resolve(blob), "image/png", 1);
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setPesan("");

      await api.put("/asesor/profile", {
        nik: profile.nik,
        gelar_depan: profile.gelar_depan,
        nama_lengkap: profile.nama_lengkap,
        gelar_belakang: profile.gelar_belakang,
        jenis_kelamin: profile.jenis_kelamin || null,
        tempat_lahir: profile.tempat_lahir,
        tanggal_lahir: profile.tanggal_lahir || null,
        kebangsaan: profile.kebangsaan,
        pendidikan_terakhir: profile.pendidikan_terakhir,
        tahun_lulus: profile.tahun_lulus || null,
        institut_asal: profile.institut_asal,
        alamat: profile.alamat,
        rt: profile.rt,
        rw: profile.rw,
        provinsi: profile.provinsi,
        kota: profile.kota,
        kecamatan: profile.kecamatan,
        kelurahan: profile.kelurahan,
        kode_pos: profile.kode_pos,
        bidang_keahlian: profile.bidang_keahlian,
        no_reg_asesor: profile.no_reg_asesor,
        no_lisensi: profile.no_lisensi,
        masa_berlaku: profile.masa_berlaku || null,
        status_asesor: profile.status_asesor || null,
      });

      setPesan("Profil asesor berhasil diperbarui");
      await fetchProfile();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Gagal memperbarui profil asesor"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setFotoProfil(file);
    setPreviewFoto(URL.createObjectURL(file));
  };

  const handleUploadFoto = async () => {
    if (!fotoProfil) {
      setError("Pilih foto profil terlebih dahulu");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setPesan("");

      const formData = new FormData();
      formData.append("foto_profil", fotoProfil);

      await api.put("/asesor/profile/upload-foto", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setPesan("Foto profil berhasil disimpan");
      setFotoProfil(null);
      await fetchProfile();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Gagal upload foto profil");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadTtd = async () => {
    if (!hasSignature) {
      setError("Silakan buat tanda tangan terlebih dahulu di canvas");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setPesan("");

      const blob = await canvasToBlob();

      if (!blob) {
        setError("Gagal membuat file tanda tangan");
        return;
      }

      const file = new File([blob], "ttd-asesor.png", {
        type: "image/png",
      });

      const formData = new FormData();
      formData.append("ttd", file);

      await api.put("/asesor/profile/upload-ttd", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setPesan("Tanda tangan berhasil disimpan");
      setHasSignature(false);
      setIsEditingTtd(false);
      await fetchProfile();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Gagal menyimpan tanda tangan");
    } finally {
      setLoading(false);
    }
  };

  const displayName =
    profile.nama_lengkap || profile.nama || profile.username || "Asesor";

  const statusLabel = profile.status_asesor || "Belum Diatur";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <SidebarAsesor isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* HERO */}
          <section className="relative overflow-hidden rounded-[36px] border border-slate-100 bg-white shadow-sm">
            <div className="absolute top-0 right-0 w-[430px] h-[430px] bg-orange-500/10 rounded-full blur-[110px]" />
            <div className="absolute -bottom-24 -left-24 w-[380px] h-[380px] bg-[#071E3D]/5 rounded-full blur-[100px]" />

            <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6 p-6 lg:p-8">
              <div className="flex flex-col justify-center">
                <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                  <ShieldCheck size={15} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                    Profile Asesor
                  </span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-black leading-tight text-[#071E3D]">
                  Lengkapi Identitas
                  <br />
                  <span className="text-orange-500">{displayName}</span>
                </h1>

                <p className="mt-5 max-w-2xl text-base lg:text-lg font-medium leading-relaxed text-slate-500">
                  Kelola data asesor, lisensi, foto profil, dan tanda tangan
                  digital agar seluruh dokumen asesmen siap digunakan.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      document
                        .getElementById("form-profile")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
                  >
                    Edit Profile
                    <ChevronRight size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      document
                        .getElementById("upload-section")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-7 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                  >
                    Dokumen Digital
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[32px] bg-[#071E3D] p-6 text-white shadow-2xl shadow-[#071E3D]/15">
                <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />

                <div className="relative z-10">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-orange-400">
                    <Sparkles size={28} />
                  </div>

                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/50">
                    Ringkasan Profile
                  </p>

                  <h2 className="mb-4 text-2xl font-black">{statusLabel}</h2>

                  <p className="text-sm font-medium leading-relaxed text-white/60">
                    Pastikan foto dan tanda tangan digital tersedia agar proses
                    administrasi asesmen berjalan lebih cepat.
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <InfoPill
                      label="Foto Profil"
                      value={previewFoto ? "Tersedia" : "Belum Ada"}
                    />
                    <InfoPill
                      label="TTD Digital"
                      value={previewTtd ? "Tersedia" : "Belum Ada"}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/asesor/dashboard")}
                    className="mt-5 w-full rounded-2xl bg-white/10 px-5 py-4 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-white/15"
                  >
                    Kembali ke Dashboard
                  </button>
                </div>
              </div>
            </div>
          </section>

          {pesan && (
            <AlertBox
              type="success"
              icon={<BadgeCheck size={20} />}
              message={pesan}
            />
          )}

          {error && (
            <AlertBox
              type="error"
              icon={<XCircle size={20} />}
              message={error}
            />
          )}

          {loading && (
            <AlertBox
              type="loading"
              icon={<Loader2 size={20} className="animate-spin" />}
              message="Memproses data..."
            />
          )}

          {/* DOKUMEN DIGITAL */}
          <section
            id="upload-section"
            className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch"
          >
            <UploadCard
              title="Foto Profil"
              description="Gunakan foto resmi asesor untuk kebutuhan identitas dan dokumen."
              icon={<Camera size={22} />}
            >
              <div className="flex h-full flex-col justify-between gap-5">
                <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-5 items-center">
                  <div className="relative h-[210px] rounded-[30px] border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden shadow-inner">
                    {previewFoto ? (
                      <img
                        src={previewFoto}
                        alt="Foto Profil"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-center px-4">
                        <User
                          size={38}
                          className="mx-auto mb-3 text-slate-300"
                        />
                        <p className="text-sm font-black text-slate-400">
                          Belum ada foto
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-400">
                          Upload foto profil asesor.
                        </p>
                      </div>
                    )}

                    <div className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
                      <ImagePlus size={20} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <label className="cursor-pointer rounded-[28px] border border-dashed border-slate-200 bg-slate-50/60 p-5 transition-all hover:border-orange-200 hover:bg-orange-50">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handleFotoChange}
                        className="hidden"
                      />

                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-white text-orange-500">
                          <UploadCloud size={22} />
                        </div>

                        <div>
                          <p className="font-black text-[#071E3D]">
                            Pilih Foto Profil
                          </p>
                          <p className="mt-1 text-xs font-medium text-slate-400">
                            Format PNG, JPG, atau JPEG
                          </p>
                        </div>
                      </div>
                    </label>

                    <button
                      type="button"
                      onClick={handleUploadFoto}
                      disabled={loading}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {loading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <UploadCloud size={16} />
                      )}
                      Upload Foto
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <SmallInfoCard
                    label="Status Foto"
                    value={previewFoto ? "Sudah tersedia" : "Belum tersedia"}
                  />
                  <SmallInfoCard
                    label="Rekomendasi"
                    value="Gunakan foto formal"
                  />
                </div>
              </div>
            </UploadCard>

            <UploadCard
              title="Tanda Tangan Digital"
              description={
                isEditingTtd
                  ? "Coret tanda tangan baru pada area canvas."
                  : "Tanda tangan sudah tersimpan. Klik ganti untuk mengubah."
              }
              icon={<FileSignature size={22} />}
            >
              <div className="rounded-[30px] border border-dashed border-orange-200 bg-orange-50/30 p-4">
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-black text-[#071E3D]">
                      {isEditingTtd
                        ? "Area Tanda Tangan"
                        : "TTD Tersimpan Saat Ini"}
                    </p>
                    <p className="text-xs font-medium text-slate-400">
                      {isEditingTtd
                        ? "Gunakan mouse, trackpad, atau layar sentuh."
                        : "Klik Ganti TTD untuk membuat tanda tangan baru."}
                    </p>
                  </div>

                  {isEditingTtd ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={clearSignature}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all hover:bg-red-50 hover:text-red-500"
                      >
                        <RotateCcw size={14} />
                        Hapus
                      </button>

                      {previewTtd && (
                        <button
                          type="button"
                          onClick={handleCancelEditTtd}
                          className="rounded-2xl border border-slate-100 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-slate-50"
                        >
                          Batal
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleEditTtd}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-[#071E3D]"
                    >
                      <PenLine size={14} />
                      Ganti TTD
                    </button>
                  )}
                </div>

                <div className="relative h-[230px] w-full overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-inner">
                  {!isEditingTtd && previewTtd ? (
                    <div className="flex h-full w-full items-center justify-center">
                      <img
                        src={previewTtd}
                        alt="Tanda Tangan Tersimpan"
                        className="max-h-full max-w-full object-contain p-5"
                      />
                    </div>
                  ) : (
                    <>
                      {!hasSignature && (
                        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                          <div className="rounded-2xl border border-slate-100 bg-white/80 px-4 py-3 text-center backdrop-blur-sm">
                            <PenLine
                              size={24}
                              className="mx-auto mb-2 text-slate-300"
                            />
                            <p className="text-xs font-bold text-slate-400">
                              Coret tanda tangan di area ini
                            </p>
                          </div>
                        </div>
                      )}

                      <canvas
                        ref={canvasRef}
                        onPointerDown={startDrawing}
                        onPointerMove={drawSignature}
                        onPointerUp={stopDrawing}
                        onPointerLeave={stopDrawing}
                        onPointerCancel={stopDrawing}
                        className="h-full w-full cursor-crosshair bg-white touch-none"
                      />
                    </>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={isEditingTtd ? handleUploadTtd : handleEditTtd}
                disabled={loading}
                className={`mt-5 flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest transition-all disabled:cursor-not-allowed disabled:bg-slate-300 ${
                  isEditingTtd
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20 hover:bg-[#071E3D]"
                    : "border border-slate-100 bg-slate-50 text-[#071E3D] hover:bg-[#071E3D] hover:text-white"
                }`}
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : isEditingTtd ? (
                  <FileSignature size={16} />
                ) : (
                  <PenLine size={16} />
                )}
                {isEditingTtd ? "Simpan TTD" : "Ganti TTD"}
              </button>
            </UploadCard>
          </section>

          {/* FORM */}
          <form
            id="form-profile"
            onSubmit={handleSubmitProfile}
            className="overflow-hidden rounded-[36px] border border-slate-100 bg-white shadow-sm"
          >
            <div className="flex flex-col gap-4 border-b border-slate-100 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                  <UserRoundCheck size={15} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                    Data Profile
                  </span>
                </div>

                <h2 className="text-2xl lg:text-3xl font-black text-[#071E3D]">
                  Informasi Asesor
                </h2>

                <p className="mt-2 text-sm font-medium text-slate-400">
                  Lengkapi data sesuai identitas dan lisensi asesor.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                Simpan Perubahan
              </button>
            </div>

            <div className="space-y-8 p-6 lg:p-8">
              <FormSection
                icon={<IdCard size={22} />}
                title="Identitas Pribadi"
                desc="Data dasar asesor yang digunakan pada dokumen asesmen."
              >
                <Input
                  label="NIK"
                  name="nik"
                  value={profile.nik}
                  onChange={handleChange}
                  maxLength={16}
                />
                <Input
                  label="Nama Lengkap"
                  name="nama_lengkap"
                  value={profile.nama_lengkap}
                  onChange={handleChange}
                />
                <Input
                  label="Gelar Depan"
                  name="gelar_depan"
                  value={profile.gelar_depan}
                  onChange={handleChange}
                />
                <Input
                  label="Gelar Belakang"
                  name="gelar_belakang"
                  value={profile.gelar_belakang}
                  onChange={handleChange}
                />

                <Select
                  label="Jenis Kelamin"
                  name="jenis_kelamin"
                  value={profile.jenis_kelamin || ""}
                  onChange={handleChange}
                  options={[
                    { value: "", label: "Pilih jenis kelamin" },
                    { value: "laki-laki", label: "Laki-laki" },
                    { value: "perempuan", label: "Perempuan" },
                  ]}
                />

                <Input
                  label="Tempat Lahir"
                  name="tempat_lahir"
                  value={profile.tempat_lahir}
                  onChange={handleChange}
                />
                <Input
                  label="Tanggal Lahir"
                  name="tanggal_lahir"
                  type="date"
                  value={profile.tanggal_lahir}
                  onChange={handleChange}
                />
                <Input
                  label="Kebangsaan"
                  name="kebangsaan"
                  value={profile.kebangsaan}
                  onChange={handleChange}
                />
              </FormSection>

              <FormSection
                icon={<BadgeCheck size={22} />}
                title="Pendidikan & Keahlian"
                desc="Informasi pendidikan terakhir dan bidang kompetensi asesor."
              >
                <Input
                  label="Pendidikan Terakhir"
                  name="pendidikan_terakhir"
                  value={profile.pendidikan_terakhir}
                  onChange={handleChange}
                />
                <Input
                  label="Tahun Lulus"
                  name="tahun_lulus"
                  type="number"
                  value={profile.tahun_lulus}
                  onChange={handleChange}
                />
                <Input
                  label="Institut Asal"
                  name="institut_asal"
                  value={profile.institut_asal}
                  onChange={handleChange}
                />
                <Input
                  label="Bidang Keahlian"
                  name="bidang_keahlian"
                  value={profile.bidang_keahlian}
                  onChange={handleChange}
                />
              </FormSection>

              <FormSection
                icon={<ShieldCheck size={22} />}
                title="Registrasi & Lisensi"
                desc="Nomor registrasi, lisensi, masa berlaku, dan status asesor."
              >
                <Input
                  label="Nomor Registrasi Asesor"
                  name="no_reg_asesor"
                  value={profile.no_reg_asesor}
                  onChange={handleChange}
                />
                <Input
                  label="Nomor Lisensi"
                  name="no_lisensi"
                  value={profile.no_lisensi}
                  onChange={handleChange}
                />
                <Input
                  label="Masa Berlaku"
                  name="masa_berlaku"
                  type="date"
                  value={profile.masa_berlaku}
                  onChange={handleChange}
                />

                <Select
                  label="Status Asesor"
                  name="status_asesor"
                  value={profile.status_asesor || ""}
                  onChange={handleChange}
                  options={[
                    { value: "", label: "Pilih status" },
                    { value: "aktif", label: "Aktif" },
                    { value: "nonaktif", label: "Nonaktif" },
                  ]}
                />
              </FormSection>

              <FormSection
                icon={<MapPin size={22} />}
                title="Alamat Domisili"
                desc="Alamat lengkap asesor untuk kebutuhan administrasi."
              >
                <div className="md:col-span-2">
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Alamat
                  </label>
                  <textarea
                    name="alamat"
                    value={profile.alamat || ""}
                    onChange={handleChange}
                    rows="4"
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                    placeholder="Masukkan alamat"
                  />
                </div>

                <Input
                  label="RT"
                  name="rt"
                  value={profile.rt}
                  onChange={handleChange}
                />
                <Input
                  label="RW"
                  name="rw"
                  value={profile.rw}
                  onChange={handleChange}
                />
                <Input
                  label="Provinsi"
                  name="provinsi"
                  value={profile.provinsi}
                  onChange={handleChange}
                />
                <Input
                  label="Kota"
                  name="kota"
                  value={profile.kota}
                  onChange={handleChange}
                />
                <Input
                  label="Kecamatan"
                  name="kecamatan"
                  value={profile.kecamatan}
                  onChange={handleChange}
                />
                <Input
                  label="Kelurahan"
                  name="kelurahan"
                  value={profile.kelurahan}
                  onChange={handleChange}
                />
                <Input
                  label="Kode Pos"
                  name="kode_pos"
                  value={profile.kode_pos}
                  onChange={handleChange}
                />
              </FormSection>
            </div>

            <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/50 p-6 sm:flex-row sm:items-center sm:justify-between lg:p-8">
              <p className="text-sm font-medium text-slate-500">
                Pastikan semua data sudah benar sebelum menyimpan perubahan.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                Simpan Profile
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

function InfoPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
      <p className="text-[9px] font-black uppercase tracking-widest text-white/40">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function AlertBox({ type, icon, message }) {
  const styles = {
    success: "border-green-100 bg-green-50 text-green-700",
    error: "border-red-100 bg-red-50 text-red-600",
    loading: "border-blue-100 bg-blue-50 text-blue-600",
  };

  return (
    <div
      className={`rounded-[24px] border px-5 py-4 text-sm font-semibold flex items-center gap-3 ${
        styles[type] || styles.loading
      }`}
    >
      <div className="shrink-0">{icon}</div>
      <span>{message}</span>
    </div>
  );
}

function UploadCard({ title, description, icon, children }) {
  return (
    <div className="h-full overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-6">
        <div>
          <h3 className="text-2xl font-black text-[#071E3D]">{title}</h3>
          <p className="mt-1 text-sm font-medium text-slate-400">
            {description}
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
          {icon}
        </div>
      </div>

      <div className="h-[calc(100%-97px)] p-6">{children}</div>
    </div>
  );
}

function SmallInfoCard({ label, value }) {
  return (
    <div className="rounded-[24px] border border-slate-100 bg-slate-50/70 p-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-[#071E3D]">{value}</p>
    </div>
  );
}

function FormSection({ icon, title, desc, children }) {
  return (
    <section className="overflow-hidden rounded-[30px] border border-slate-100 bg-slate-50/50">
      <div className="flex items-start gap-4 border-b border-slate-100 bg-white p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
          {icon}
        </div>

        <div>
          <h3 className="text-lg font-black text-[#071E3D]">{title}</h3>
          <p className="mt-1 text-sm font-medium text-slate-400">{desc}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
  maxLength,
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        maxLength={maxLength}
        className="w-full rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
        placeholder={`Masukkan ${label.toLowerCase()}`}
      />
    </div>
  );
}

function Select({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </label>

      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        className="w-full rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-semibold text-[#071E3D] outline-none transition-all focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
      >
        {options.map((item) => (
          <option key={`${name}-${item.value}`} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}