import React, { useEffect, useRef, useState } from "react";
import SidebarAsesor from "../../components/sidebar/SidebarAsesor";
import {
  BadgeCheck,
  Camera,
  FileSignature,
  IdCard,
  ImagePlus,
  Loader2,
  MapPin,
  PenLine,
  RefreshCcw,
  RotateCcw,
  Save,
  ShieldCheck,
  UploadCloud,
  User,
} from "lucide-react";
import { notifikasi } from "../../components/ui/notifikasi";
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

  const getFileUrl = (filePath) => {
    if (!filePath) {
      return "";
    }

    const cleanPath = String(filePath).replace(/\\/g, "/");

    if (
      cleanPath.startsWith("http://") ||
      cleanPath.startsWith("https://")
    ) {
      return cleanPath;
    }

    return `${BASE_URL}/${cleanPath.replace(/^\/+/, "")}`;
  };

  const formatDateForInput = (dateValue) => {
    if (!dateValue) {
      return "";
    }

    return String(dateValue).slice(0, 10);
  };

  const setupSignatureCanvas = () => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;

    canvas.width = Math.max(1, rect.width * ratio);
    canvas.height = Math.max(1, rect.height * ratio);

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#071E3D";
  };

  const fetchProfile = async ({
    showLoading = true,
    showSuccess = false,
  } = {}) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

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

      if (showSuccess) {
        await notifikasi.sukses(
          "Berhasil",
          "Data profile asesor berhasil diperbarui."
        );
      }
    } catch (err) {
      console.error(err);

      await notifikasi.gagal(
        "Gagal Memuat Profile",
        err.response?.data?.message ||
          "Data profile asesor gagal dimuat dari server."
      );
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchProfile({
      showLoading: true,
      showSuccess: false,
    });
  }, []);

  useEffect(() => {
    if (!isEditingTtd) {
      return;
    }

    const timer = setTimeout(() => {
      setupSignatureCanvas();
    }, 80);

    return () => {
      clearTimeout(timer);
    };
  }, [isEditingTtd]);

  useEffect(() => {
    const handleResize = () => {
      if (!isEditingTtd) {
        return;
      }

      setupSignatureCanvas();
      setHasSignature(false);
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
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

    const canvas = canvasRef.current;

    if (canvas?.setPointerCapture) {
      canvas.setPointerCapture(event.pointerId);
    }
  };

  const drawSignature = (event) => {
    if (!isDrawingRef.current) {
      return;
    }

    event.preventDefault();

    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    const currentPoint = getCanvasPoint(event);
    const lastPoint = lastPointRef.current;

    ctx.beginPath();
    ctx.moveTo(
      lastPoint.x,
      lastPoint.y
    );
    ctx.lineTo(
      currentPoint.x,
      currentPoint.y
    );
    ctx.stroke();

    lastPointRef.current = currentPoint;
    setHasSignature(true);
  };

  const stopDrawing = (event) => {
    isDrawingRef.current = false;

    const canvas = canvasRef.current;

    if (
      canvas?.releasePointerCapture &&
      event?.pointerId !== undefined
    ) {
      try {
        canvas.releasePointerCapture(
          event.pointerId
        );
      } catch {
        return;
      }
    }
  };

  const clearSignature = () => {
    setupSignatureCanvas();
    setHasSignature(false);
  };

  const handleEditTtd = () => {
    setIsEditingTtd(true);
    setHasSignature(false);

    setTimeout(() => {
      setupSignatureCanvas();
    }, 80);
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

      canvas.toBlob(
        (blob) => resolve(blob),
        "image/png",
        1
      );
    });
  };

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFotoChange = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setFotoProfil(file);

    const objectUrl =
      URL.createObjectURL(file);

    setPreviewFoto(objectUrl);
  };

  const handleSubmitProfile = async (
    event
  ) => {
    event.preventDefault();

    try {
      setLoading(true);

      await api.put(
        "/asesor/profile",
        {
          nik: profile.nik,
          gelar_depan:
            profile.gelar_depan,
          nama_lengkap:
            profile.nama_lengkap,
          gelar_belakang:
            profile.gelar_belakang,
          jenis_kelamin:
            profile.jenis_kelamin ||
            null,
          tempat_lahir:
            profile.tempat_lahir,
          tanggal_lahir:
            profile.tanggal_lahir ||
            null,
          kebangsaan:
            profile.kebangsaan,
          pendidikan_terakhir:
            profile.pendidikan_terakhir,
          tahun_lulus:
            profile.tahun_lulus ||
            null,
          institut_asal:
            profile.institut_asal,
          alamat:
            profile.alamat,
          rt: profile.rt,
          rw: profile.rw,
          provinsi:
            profile.provinsi,
          kota: profile.kota,
          kecamatan:
            profile.kecamatan,
          kelurahan:
            profile.kelurahan,
          kode_pos:
            profile.kode_pos,
          bidang_keahlian:
            profile.bidang_keahlian,
          no_reg_asesor:
            profile.no_reg_asesor,
          no_lisensi:
            profile.no_lisensi,
          masa_berlaku:
            profile.masa_berlaku ||
            null,
          status_asesor:
            profile.status_asesor ||
            null,
        }
      );

      if (fotoProfil) {
        const formDataFoto =
          new FormData();

        formDataFoto.append(
          "foto_profil",
          fotoProfil
        );

        await api.put(
          "/asesor/profile/upload-foto",
          formDataFoto,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );
      }

      if (
        isEditingTtd &&
        hasSignature
      ) {
        const blob =
          await canvasToBlob();

        if (!blob) {
          throw new Error(
            "Canvas tanda tangan gagal diproses menjadi gambar."
          );
        }

        const fileTtd = new File(
          [blob],
          "ttd-asesor.png",
          {
            type: "image/png",
          }
        );

        const formDataTtd =
          new FormData();

        formDataTtd.append(
          "ttd",
          fileTtd
        );

        await api.put(
          "/asesor/profile/upload-ttd",
          formDataTtd,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );
      }

      setFotoProfil(null);
      setHasSignature(false);

      await fetchProfile({
        showLoading: false,
        showSuccess: false,
      });

      await notifikasi.sukses(
        "Berhasil",
        "Data profile asesor berhasil disimpan."
      );
    } catch (err) {
      console.error(err);

      await notifikasi.gagal(
        "Gagal Menyimpan Profile",
        err.response?.data?.message ||
          err.message ||
          "Profile asesor gagal disimpan. Periksa kembali data Anda."
      );
    } finally {
      setLoading(false);
    }
  };

  const displayName =
    profile.nama_lengkap ||
    profile.nama ||
    profile.username ||
    "Asesor";

  const statusLabel =
    profile.status_asesor ||
    "Belum Diatur";

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <SidebarAsesor
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
                    Kelola identitas, sertifikasi, foto profil, dan tanda tangan digital asesor.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    fetchProfile({
                      showLoading: true,
                      showSuccess: true,
                    })
                  }
                  disabled={loading}
                  className="rounded-lg border border-[#071E3D]/20 bg-white px-4 py-2.5 text-[12px] font-bold text-[#071E3D] shadow-sm transition-all hover:border-[#071E3D] hover:bg-[#071E3D] hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading ? (
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />
                    ) : (
                      <RefreshCcw
                        size={15}
                      />
                    )}
                    Refresh
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3 md:p-6">
              <ProfileStat
                icon={<User size={21} />}
                label="Nama Asesor"
                value={displayName}
              />

              <ProfileStat
                icon={
                  <BadgeCheck
                    size={21}
                  />
                }
                label="Status Asesor"
                value={statusLabel}
                tone={
                  profile.status_asesor ===
                  "aktif"
                    ? "green"
                    : "orange"
                }
              />

              <ProfileStat
                icon={
                  <ShieldCheck
                    size={21}
                  />
                }
                label="Registrasi"
                value={
                  profile.no_reg_asesor ||
                  "Belum tersedia"
                }
              />
            </div>
          </section>

          <form
            id="profileForm"
            onSubmit={
              handleSubmitProfile
            }
            className="space-y-5"
          >
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
                    Foto resmi asesor untuk identitas profile.
                  </p>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-[180px_1fr] md:items-center">
                    <div className="relative h-[210px] overflow-hidden rounded-lg border border-[#071E3D]/10 bg-[#FAFAFA]">
                      {previewFoto ? (
                        <img
                          src={previewFoto}
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
                              Pilih foto profil asesor.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-3">
                      <label className="cursor-pointer rounded-lg border border-dashed border-[#CC6B27]/40 bg-[#CC6B27]/5 p-5 transition-all hover:border-[#CC6B27] hover:bg-[#CC6B27]/10">
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg"
                          onChange={
                            handleFotoChange
                          }
                          className="hidden"
                        />

                        <div className="flex items-center gap-4">
                          <div className="rounded-lg bg-white p-3 text-[#CC6B27] shadow-sm">
                            <UploadCloud
                              size={22}
                            />
                          </div>

                          <div>
                            <p className="text-[13px] font-bold text-[#071E3D]">
                              Pilih Foto Profil
                            </p>

                            <p className="mt-1 text-[11px] font-medium text-[#182D4A]/60">
                              PNG, JPG, atau JPEG
                            </p>
                          </div>
                        </div>
                      </label>

                      {fotoProfil && (
                        <div className="rounded-lg border border-[#CC6B27]/20 bg-[#CC6B27]/5 px-4 py-3">
                          <p className="text-[11px] font-bold text-[#071E3D]">
                            Foto baru siap disimpan
                          </p>

                          <p className="mt-1 truncate text-[11px] font-medium text-[#182D4A]/60">
                            {fotoProfil.name}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <SmallInfoCard
                          label="Status Foto"
                          value={
                            previewFoto
                              ? "Sudah tersedia"
                              : "Belum tersedia"
                          }
                        />

                        <SmallInfoCard
                          label="Format"
                          value="PNG, JPG, JPEG"
                        />
                      </div>
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
                    Tanda tangan yang digunakan pada dokumen asesor.
                  </p>
                </div>

                <div className="p-5">
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-[13px] font-bold text-[#071E3D]">
                        {isEditingTtd
                          ? "Area Tanda Tangan"
                          : "TTD Tersimpan"}
                      </p>

                      <p className="mt-1 text-[11px] font-medium text-[#182D4A]/60">
                        {isEditingTtd
                          ? "Gunakan mouse, trackpad, atau layar sentuh."
                          : "Tanda tangan digital yang tersimpan saat ini."}
                      </p>
                    </div>

                    {!isEditingTtd && (
                      <button
                        type="button"
                        onClick={
                          handleEditTtd
                        }
                        className="rounded-lg border border-[#CC6B27]/40 bg-white px-4 py-2 text-[11px] font-bold text-[#CC6B27] transition-all hover:border-[#CC6B27] hover:bg-[#CC6B27] hover:text-white"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <PenLine
                            size={14}
                          />
                          Ganti TTD
                        </span>
                      </button>
                    )}
                  </div>

                  <div className="relative h-[235px] overflow-hidden rounded-lg border border-[#071E3D]/10 bg-[#FAFAFA]">
                    {!isEditingTtd &&
                    previewTtd ? (
                      <div className="flex h-full items-center justify-center bg-white">
                        <img
                          src={previewTtd}
                          alt="Tanda Tangan"
                          className="max-h-full max-w-full object-contain p-8"
                        />
                      </div>
                    ) : (
                      <>
                        {!hasSignature && (
                          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                            <div className="rounded-lg border border-[#071E3D]/10 bg-white px-5 py-4 text-center shadow-sm">
                              <PenLine
                                size={25}
                                className="mx-auto mb-2 text-[#071E3D]/20"
                              />

                              <p className="text-[12px] font-bold text-[#071E3D]">
                                Buat Tanda Tangan
                              </p>

                              <p className="mt-1 text-[10px] font-medium text-[#182D4A]/60">
                                Coret pada area putih.
                              </p>
                            </div>
                          </div>
                        )}

                        <canvas
                          ref={canvasRef}
                          onPointerDown={
                            startDrawing
                          }
                          onPointerMove={
                            drawSignature
                          }
                          onPointerUp={
                            stopDrawing
                          }
                          onPointerLeave={
                            stopDrawing
                          }
                          onPointerCancel={
                            stopDrawing
                          }
                          className="h-full w-full cursor-crosshair bg-white touch-none"
                        />
                      </>
                    )}
                  </div>

                  {isEditingTtd && (
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={
                          clearSignature
                        }
                        className="rounded-lg border border-[#071E3D]/20 bg-white px-4 py-2.5 text-[12px] font-bold text-[#071E3D] transition-all hover:border-[#071E3D] hover:bg-[#071E3D] hover:text-white"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <RotateCcw
                            size={15}
                          />
                          Bersihkan
                        </span>
                      </button>

                      {previewTtd && (
                        <button
                          type="button"
                          onClick={
                            handleCancelEditTtd
                          }
                          className="rounded-lg border border-[#071E3D]/20 bg-white px-4 py-2.5 text-[12px] font-bold text-[#071E3D] transition-all hover:border-[#071E3D] hover:bg-[#071E3D] hover:text-white"
                        >
                          Batal
                        </button>
                      )}

                      {hasSignature && (
                        <div className="flex items-center rounded-lg border border-[#CC6B27]/20 bg-[#CC6B27]/5 px-4 py-2.5 text-[11px] font-semibold text-[#CC6B27]">
                          TTD baru siap disimpan
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>
            </section>

            <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
              <div className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-5 py-3.5 md:px-6">
                <h2 className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-white">
                  <IdCard
                    size={17}
                    className="text-[#CC6B27]"
                  />
                  Informasi Profile
                </h2>
              </div>

              <div className="border-b border-[#071E3D]/10 bg-white px-5 py-3 md:px-6">
                <p className="text-[12px] font-medium text-[#182D4A]/60">
                  Lengkapi seluruh data asesor dengan benar.
                </p>
              </div>

              <div className="space-y-5 p-5 md:p-6">
                <FormSection
                  icon={<User size={18} />}
                  title="Identitas Pribadi"
                  desc="Data dasar identitas asesor."
                >
                  <FormInput label="NIK">
                    <input
                      type="text"
                      name="nik"
                      value={profile.nik || ""}
                      onChange={
                        handleChange
                      }
                      maxLength="16"
                      className={inputClass()}
                      placeholder="Masukkan NIK"
                    />
                  </FormInput>

                  <FormInput label="Nama Lengkap">
                    <input
                      type="text"
                      name="nama_lengkap"
                      value={
                        profile.nama_lengkap ||
                        ""
                      }
                      onChange={
                        handleChange
                      }
                      className={inputClass()}
                      placeholder="Masukkan nama lengkap"
                    />
                  </FormInput>

                  <FormInput label="Gelar Depan">
                    <input
                      type="text"
                      name="gelar_depan"
                      value={
                        profile.gelar_depan ||
                        ""
                      }
                      onChange={
                        handleChange
                      }
                      className={inputClass()}
                      placeholder="Masukkan gelar depan"
                    />
                  </FormInput>

                  <FormInput label="Gelar Belakang">
                    <input
                      type="text"
                      name="gelar_belakang"
                      value={
                        profile.gelar_belakang ||
                        ""
                      }
                      onChange={
                        handleChange
                      }
                      className={inputClass()}
                      placeholder="Masukkan gelar belakang"
                    />
                  </FormInput>

                  <FormInput label="Jenis Kelamin">
                    <select
                      name="jenis_kelamin"
                      value={
                        profile.jenis_kelamin ||
                        ""
                      }
                      onChange={
                        handleChange
                      }
                      className={inputClass()}
                    >
                      <option value="">
                        Pilih jenis kelamin
                      </option>
                      <option value="laki-laki">
                        Laki-laki
                      </option>
                      <option value="perempuan">
                        Perempuan
                      </option>
                    </select>
                  </FormInput>

                  <FormInput label="Tempat Lahir">
                    <input
                      type="text"
                      name="tempat_lahir"
                      value={
                        profile.tempat_lahir ||
                        ""
                      }
                      onChange={
                        handleChange
                      }
                      className={inputClass()}
                      placeholder="Masukkan tempat lahir"
                    />
                  </FormInput>

                  <FormInput label="Tanggal Lahir">
                    <input
                      type="date"
                      name="tanggal_lahir"
                      value={
                        profile.tanggal_lahir ||
                        ""
                      }
                      onChange={
                        handleChange
                      }
                      className={inputClass()}
                    />
                  </FormInput>

                  <FormInput label="Kebangsaan">
                    <input
                      type="text"
                      name="kebangsaan"
                      value={
                        profile.kebangsaan ||
                        ""
                      }
                      onChange={
                        handleChange
                      }
                      className={inputClass()}
                      placeholder="Masukkan kebangsaan"
                    />
                  </FormInput>
                </FormSection>

                <FormSection
                  icon={
                    <BadgeCheck
                      size={18}
                    />
                  }
                  title="Pendidikan & Keahlian"
                  desc="Informasi pendidikan dan bidang keahlian asesor."
                >
                  <FormInput label="Pendidikan Terakhir">
                    <select
                      name="pendidikan_terakhir"
                      value={
                        profile.pendidikan_terakhir ||
                        ""
                      }
                      onChange={
                        handleChange
                      }
                      className={inputClass()}
                    >
                      <option value="">
                        Pilih pendidikan
                      </option>
                      <option value="D3">
                        D3
                      </option>
                      <option value="D4">
                        D4
                      </option>
                      <option value="S1">
                        S1
                      </option>
                      <option value="S2">
                        S2
                      </option>
                      <option value="S3">
                        S3
                      </option>
                    </select>
                  </FormInput>

                  <FormInput label="Tahun Lulus">
                    <input
                      type="text"
                      name="tahun_lulus"
                      value={
                        profile.tahun_lulus ||
                        ""
                      }
                      onChange={
                        handleChange
                      }
                      maxLength="4"
                      inputMode="numeric"
                      className={inputClass()}
                      placeholder="Contoh: 2024"
                    />
                  </FormInput>

                  <FormInput label="Institut Asal">
                    <input
                      type="text"
                      name="institut_asal"
                      value={
                        profile.institut_asal ||
                        ""
                      }
                      onChange={
                        handleChange
                      }
                      className={inputClass()}
                      placeholder="Nama institusi"
                    />
                  </FormInput>

                  <FormInput label="Bidang Keahlian">
                    <input
                      type="text"
                      name="bidang_keahlian"
                      value={
                        profile.bidang_keahlian ||
                        ""
                      }
                      onChange={
                        handleChange
                      }
                      className={inputClass()}
                      placeholder="Bidang keahlian"
                    />
                  </FormInput>
                </FormSection>

                <FormSection
                  icon={
                    <ShieldCheck
                      size={18}
                    />
                  }
                  title="Registrasi & Lisensi"
                  desc="Data registrasi dan lisensi asesor."
                >
                  <FormInput label="No. Registrasi Asesor">
                    <input
                      type="text"
                      name="no_reg_asesor"
                      value={
                        profile.no_reg_asesor ||
                        ""
                      }
                      onChange={
                        handleChange
                      }
                      className={inputClass()}
                      placeholder="Nomor registrasi asesor"
                    />
                  </FormInput>

                  <FormInput label="No. Lisensi">
                    <input
                      type="text"
                      name="no_lisensi"
                      value={
                        profile.no_lisensi ||
                        ""
                      }
                      onChange={
                        handleChange
                      }
                      className={inputClass()}
                      placeholder="Nomor lisensi"
                    />
                  </FormInput>

                  <FormInput label="Masa Berlaku">
                    <input
                      type="date"
                      name="masa_berlaku"
                      value={
                        profile.masa_berlaku ||
                        ""
                      }
                      onChange={
                        handleChange
                      }
                      className={inputClass()}
                    />
                  </FormInput>

                  <FormInput label="Status Asesor">
                    <select
                      name="status_asesor"
                      value={
                        profile.status_asesor ||
                        ""
                      }
                      onChange={
                        handleChange
                      }
                      className={inputClass()}
                    >
                      <option value="">
                        Pilih status
                      </option>
                      <option value="aktif">
                        Aktif
                      </option>
                      <option value="nonaktif">
                        Nonaktif
                      </option>
                    </select>
                  </FormInput>
                </FormSection>

                <FormSection
                  icon={
                    <MapPin
                      size={18}
                    />
                  }
                  title="Alamat"
                  desc="Alamat sesuai data profile asesor."
                >
                  <div className="md:col-span-2">
                    <FormInput label="Alamat Lengkap">
                      <textarea
                        name="alamat"
                        value={
                          profile.alamat ||
                          ""
                        }
                        onChange={
                          handleChange
                        }
                        rows="3"
                        className={`${inputClass()} resize-none`}
                        placeholder="Masukkan alamat lengkap"
                      />
                    </FormInput>
                  </div>

                  <FormInput label="RT">
                    <input
                      type="text"
                      name="rt"
                      value={
                        profile.rt ||
                        ""
                      }
                      onChange={
                        handleChange
                      }
                      maxLength="3"
                      inputMode="numeric"
                      className={inputClass()}
                      placeholder="RT"
                    />
                  </FormInput>

                  <FormInput label="RW">
                    <input
                      type="text"
                      name="rw"
                      value={
                        profile.rw ||
                        ""
                      }
                      onChange={
                        handleChange
                      }
                      maxLength="3"
                      inputMode="numeric"
                      className={inputClass()}
                      placeholder="RW"
                    />
                  </FormInput>

                  <FormInput label="Provinsi">
                    <input
                      type="text"
                      name="provinsi"
                      value={
                        profile.provinsi ||
                        ""
                      }
                      onChange={
                        handleChange
                      }
                      className={inputClass()}
                      placeholder="Provinsi"
                    />
                  </FormInput>

                  <FormInput label="Kota / Kabupaten">
                    <input
                      type="text"
                      name="kota"
                      value={
                        profile.kota ||
                        ""
                      }
                      onChange={
                        handleChange
                      }
                      className={inputClass()}
                      placeholder="Kota / Kabupaten"
                    />
                  </FormInput>

                  <FormInput label="Kecamatan">
                    <input
                      type="text"
                      name="kecamatan"
                      value={
                        profile.kecamatan ||
                        ""
                      }
                      onChange={
                        handleChange
                      }
                      className={inputClass()}
                      placeholder="Kecamatan"
                    />
                  </FormInput>

                  <FormInput label="Kelurahan">
                    <input
                      type="text"
                      name="kelurahan"
                      value={
                        profile.kelurahan ||
                        ""
                      }
                      onChange={
                        handleChange
                      }
                      className={inputClass()}
                      placeholder="Kelurahan"
                    />
                  </FormInput>

                  <FormInput label="Kode Pos">
                    <input
                      type="text"
                      name="kode_pos"
                      value={
                        profile.kode_pos ||
                        ""
                      }
                      onChange={
                        handleChange
                      }
                      maxLength="5"
                      inputMode="numeric"
                      className={inputClass()}
                      placeholder="Kode pos"
                    />
                  </FormInput>
                </FormSection>
              </div>

              <div className="flex flex-col gap-3 border-t border-[#071E3D]/10 bg-[#FAFAFA] px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#182D4A]/50">
                    Simpan Profile
                  </p>

                  <p className="mt-1 text-[12px] font-medium leading-relaxed text-[#182D4A]/60">
                    Semua perubahan data, foto profil, dan tanda tangan akan disimpan melalui tombol ini.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-[#CC6B27] px-5 py-2.5 text-[12px] font-bold text-white shadow-sm transition-all hover:bg-[#A8561F] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading ? (
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />
                    ) : (
                      <Save size={15} />
                    )}
                    Simpan Profile
                  </span>
                </button>
              </div>
            </section>
          </form>
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
    blue: {
      icon: "bg-blue-50 text-blue-600",
      value: "text-[#071E3D]",
    },
  };

  const current =
    tones[tone] ||
    tones.orange;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#071E3D]/10 bg-white p-4 shadow-sm">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${current.icon}`}>
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#182D4A]/60">
          {label}
        </p>

        <p className={`mt-1 truncate text-[15px] font-black ${current.value}`}>
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

function FormSection({
  icon,
  title,
  desc,
  children,
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-[#FAFAFA]">
      <div className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-5 py-3.5">
        <h3 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-white">
          <span className="text-[#CC6B27]">
            {icon}
          </span>
          {title}
        </h3>
      </div>

      <div className="border-b border-[#071E3D]/10 bg-white px-5 py-3">
        <p className="text-[11px] font-medium text-[#182D4A]/60">
          {desc}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

function FormInput({
  label,
  required = false,
  error,
  children,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-bold text-[#071E3D]">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      {children}

      {error && (
        <span className="mt-1 block text-[11px] font-medium text-red-500">
          {error}
        </span>
      )}
    </div>
  );
}

function SmallInfoCard({
  label,
  value,
}) {
  return (
    <div className="rounded-lg border border-[#071E3D]/10 bg-[#FAFAFA] p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#182D4A]/60">
        {label}
      </p>

      <p className="mt-1 text-[12px] font-bold text-[#071E3D]">
        {value}
      </p>
    </div>
  );
}

function inputClass() {
  return "w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] p-2.5 text-[13px] font-medium text-[#071E3D] outline-none transition-all placeholder:text-[#182D4A]/40 focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10";
}