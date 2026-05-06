import React, { useEffect, useMemo, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import {
  AlertCircle,
  BadgeCheck,
  ChevronRight,
  Download,
  Eraser,
  FileText,
  ImagePlus,
  Loader2,
  PenLine,
  RefreshCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Upload,
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

const documentFields = [
  {
    key: "pas_foto",
    label: "Pas Foto",
    accept: "image/png,image/jpeg,image/jpg,image/webp",
  },
  {
    key: "ktp",
    label: "KTP",
    accept: "image/png,image/jpeg,image/jpg,image/webp,application/pdf",
  },
  {
    key: "ijazah",
    label: "Ijazah",
    accept: "image/png,image/jpeg,image/jpg,image/webp,application/pdf",
  },
  {
    key: "transkrip",
    label: "Transkrip",
    accept: "image/png,image/jpeg,image/jpg,image/webp,application/pdf",
  },
  {
    key: "kk",
    label: "Kartu Keluarga",
    accept: "image/png,image/jpeg,image/jpg,image/webp,application/pdf",
  },
  {
    key: "surat_kerja",
    label: "Surat Kerja",
    accept: "image/png,image/jpeg,image/jpg,image/webp,application/pdf",
  },
  {
    key: "foto_profil",
    label: "Foto Profil",
    accept: "image/png,image/jpeg,image/jpg,image/webp",
  },
  {
    key: "portofolio",
    label: "Portofolio",
    accept: "image/png,image/jpeg,image/jpg,image/webp,application/pdf",
  },
];

export default function ProfileDokumen() {
  const navigate = useNavigate();
  const sigRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [dataFiles, setDataFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingTTD, setSavingTTD] = useState(false);
  const [refreshKey, setRefreshKey] = useState(Date.now());
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const imageBase = API_BASE.replace("/api", "");

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

  const ttdUrl = useMemo(() => {
    return (
      resolveFileUrl(dataFiles.ttd) ||
      resolveFileUrl(dataFiles.tanda_tangan) ||
      ""
    );
  }, [dataFiles]);

  const totalDokumen = documentFields.length;
  const dokumenTerisi = documentFields.filter((item) =>
    Boolean(dataFiles[item.key])
  ).length;

  const selectedCount = Object.keys(selectedFiles).length;

  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFiles = async () => {
    try {
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const res = await api.get("/asesi/profile/files");
      setDataFiles(res.data?.data || {});
      setRefreshKey(Date.now());
    } catch (err) {
      console.error("FETCH FILES ERROR:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Gagal mengambil data dokumen."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    setSelectedFiles({});
    await fetchFiles();
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files?.[0];

    setError("");
    setSuccess("");

    if (!file) return;

    setSelectedFiles((prev) => ({
      ...prev,
      [name]: file,
    }));
  };

  const removeSelectedFile = (key) => {
    setSelectedFiles((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const uploadFiles = async () => {
    if (!Object.keys(selectedFiles).length) {
      alert("Pilih file terlebih dahulu.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const formData = new FormData();

      Object.entries(selectedFiles).forEach(([key, file]) => {
        formData.append(key, file);
      });

      await api.put("/asesi/profile/upload-dokumen", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Dokumen berhasil diupload.");
      setSelectedFiles({});
      await fetchFiles();
    } catch (err) {
      console.error("UPLOAD FILE ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Upload dokumen gagal."
      );
    } finally {
      setUploading(false);
    }
  };

  const saveTTD = async () => {
    if (!sigRef.current || sigRef.current.isEmpty()) {
      alert("Tanda tangan masih kosong.");
      return;
    }

    try {
      setSavingTTD(true);
      setError("");
      setSuccess("");

      const ttdBase64 = sigRef.current.getCanvas().toDataURL("image/png");

      await api.put("/asesi/profile/upload-ttd", {
        ttd_base64: ttdBase64,
      });

      setSuccess("Tanda tangan berhasil disimpan.");
      sigRef.current.clear();
      await fetchFiles();
    } catch (err) {
      console.error("SAVE TTD ERROR:", err);

      setError(
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

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
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
                    Dokumen Profile
                  </span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-black leading-tight text-[#071E3D]">
                  Dokumen &
                  <br />
                  <span className="text-orange-500">Tanda Tangan</span>
                </h1>

                <p className="mt-5 max-w-2xl text-base lg:text-lg font-medium leading-relaxed text-slate-500">
                  Upload dokumen persyaratan dan buat atau ganti tanda tangan
                  digital untuk keperluan asesmen.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={uploadFiles}
                    disabled={uploading || selectedCount === 0}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {uploading ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <Upload size={17} />
                    )}
                    {uploading
                      ? "Uploading..."
                      : selectedCount
                      ? `Upload ${selectedCount} File`
                      : "Pilih File Dulu"}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/asesi/profile")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-7 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                  >
                    Lihat Profile
                    <ChevronRight size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={handleRefresh}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-7 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-orange-500 hover:text-white"
                  >
                    <RefreshCcw size={17} />
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
                    Ringkasan Dokumen
                  </p>

                  <h2 className="text-2xl font-black leading-tight">
                    {dokumenTerisi}/{totalDokumen} Dokumen Terisi
                  </h2>

                  <p className="mt-4 text-sm font-medium leading-relaxed text-white/60">
                    TTD digital: {ttdUrl ? "sudah tersedia" : "belum dibuat"}.
                    File yang dipilih saat ini: {selectedCount}.
                  </p>

                  <div className="mt-auto pt-6 grid grid-cols-2 gap-3">
                    <HeroPill label="Dokumen" value={`${dokumenTerisi}/${totalDokumen}`} />
                    <HeroPill label="TTD" value={ttdUrl ? "Ada" : "Belum"} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {error && <AlertMessage type="error" text={error} />}
          {success && <AlertMessage type="success" text={success} />}

          <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <MiniStat
              icon={<FileText size={22} />}
              label="Dokumen"
              value={`${dokumenTerisi}/${totalDokumen} Terisi`}
            />

            <MiniStat
              icon={<Upload size={22} />}
              label="File Dipilih"
              value={`${selectedCount} File`}
            />

            <MiniStat
              icon={<PenLine size={22} />}
              label="Status TTD"
              value={ttdUrl ? "Tersedia" : "Belum Ada"}
            />
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-[1fr_430px] gap-6 items-start">
            <Card title="Upload Dokumen" icon={<FileText size={22} />}>
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                {documentFields.map((field) => (
                  <DocumentUploadBox
                    key={field.key}
                    field={field}
                    currentUrl={resolveFileUrl(dataFiles[field.key])}
                    selectedFile={selectedFiles[field.key]}
                    refreshKey={refreshKey}
                    onChange={handleFileChange}
                    onRemove={() => removeSelectedFile(field.key)}
                  />
                ))}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={uploadFiles}
                  disabled={uploading || selectedCount === 0}
                  className="px-6 py-4 rounded-2xl bg-orange-500 hover:bg-[#071E3D] text-white font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Upload size={17} />
                  )}
                  {uploading ? "Uploading..." : "Upload Dokumen Terpilih"}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedFiles({})}
                  disabled={uploading || selectedCount === 0}
                  className="px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-red-50 hover:text-red-600 text-[#071E3D] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Eraser size={17} />
                  Batal Pilihan
                </button>
              </div>
            </Card>

            <Card title="Tanda Tangan Digital" icon={<PenLine size={22} />}>
              {ttdUrl ? (
                <div className="rounded-[24px] border border-emerald-100 bg-emerald-50 p-5 mb-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                        TTD Tersimpan
                      </p>
                      <p className="text-sm font-black text-emerald-700 mt-1">
                        Tanda tangan digital sudah tersedia. Buat TTD baru di
                        canvas untuk mengganti.
                      </p>
                    </div>

                    <BadgeCheck size={24} className="text-emerald-600" />
                  </div>

                  <div className="rounded-2xl bg-white border border-emerald-100 p-4 flex items-center justify-center min-h-[130px]">
                    <img
                      src={`${ttdUrl}${ttdUrl.includes("?") ? "&" : "?"}t=${refreshKey}`}
                      alt="Tanda Tangan Tersimpan"
                      className="max-h-[110px] object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-[24px] border border-orange-100 bg-orange-50 p-5 mb-5 flex gap-3 text-orange-600">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-black">TTD belum tersedia</p>
                    <p className="text-sm font-semibold mt-1">
                      Silakan tanda tangan di canvas putih lalu klik Simpan TTD.
                    </p>
                  </div>
                </div>
              )}

              <div className="mb-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Canvas TTD Baru
                </p>
                <p className="text-sm font-semibold text-slate-500 mt-1">
                  Gunakan mouse atau layar sentuh untuk membuat tanda tangan.
                </p>
              </div>

              <div className="rounded-[24px] overflow-hidden border-2 border-dashed border-slate-200 bg-white">
                <SignatureCanvas
                  ref={sigRef}
                  penColor="#071E3D"
                  canvasProps={{
                    className: "w-full h-[220px] bg-white block",
                  }}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-5">
                <button
                  type="button"
                  onClick={saveTTD}
                  disabled={savingTTD}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  {savingTTD ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Save size={17} />
                  )}
                  {savingTTD ? "Menyimpan..." : "Simpan TTD"}
                </button>

                <button
                  type="button"
                  onClick={clearTTD}
                  disabled={savingTTD}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
                >
                  <Eraser size={17} />
                  Bersihkan
                </button>
              </div>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}

function DocumentUploadBox({
  field,
  currentUrl,
  selectedFile,
  refreshKey,
  onChange,
  onRemove,
}) {
  const ready = Boolean(currentUrl);

  return (
    <div
      className={`rounded-[24px] border p-5 transition ${
        ready
          ? "bg-emerald-50 border-emerald-100"
          : "bg-slate-50 border-slate-100"
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p
            className={`text-[10px] font-black uppercase tracking-widest mb-2 ${
              ready ? "text-emerald-600" : "text-slate-400"
            }`}
          >
            {field.label}
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

      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs font-black uppercase tracking-widest text-[#071E3D] border border-white hover:bg-[#071E3D] hover:text-white transition-all">
        <ImagePlus size={15} />
        Pilih File
        <input
          type="file"
          name={field.key}
          accept={field.accept}
          onChange={onChange}
          className="hidden"
        />
      </label>

      {selectedFile && (
        <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-orange-500">
            File Baru
          </p>

          <p className="mt-1 text-sm font-black text-[#071E3D] break-words">
            {selectedFile.name}
          </p>

          <button
            type="button"
            onClick={onRemove}
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-red-500 border border-red-100 hover:bg-red-50"
          >
            <Eraser size={13} />
            Batal
          </button>
        </div>
      )}

      {ready && (
        <a
          href={`${currentUrl}${currentUrl.includes("?") ? "&" : "?"}t=${refreshKey}`}
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

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-5">
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl p-10 text-center max-w-sm w-full">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#071E3D] flex items-center justify-center mb-5">
          <Loader2 className="animate-spin text-white" size={34} />
        </div>

        <h2 className="text-[#071E3D] font-black text-xl">
          Memuat Dokumen
        </h2>

        <p className="text-slate-500 text-sm mt-2 font-medium">
          Mengambil dokumen dan tanda tangan asesi.
        </p>
      </div>
    </div>
  );
}

function AlertMessage({ type, text }) {
  const isSuccess = type === "success";

  return (
    <div
      className={`rounded-[24px] border px-5 py-4 text-sm font-semibold flex items-start gap-3 ${
        isSuccess
          ? "bg-emerald-50 border-emerald-100 text-emerald-700"
          : "bg-red-50 border-red-100 text-red-600"
      }`}
    >
      {isSuccess ? (
        <BadgeCheck size={20} className="shrink-0 mt-0.5" />
      ) : (
        <AlertCircle size={20} className="shrink-0 mt-0.5" />
      )}

      <div>
        <p className="font-black">
          {isSuccess ? "Berhasil" : "Terjadi Kesalahan"}
        </p>
        <p className="mt-1 font-medium">{text}</p>
      </div>
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
            Kelola Profile
          </p>
        </div>
      </div>

      <div className="p-6">{children}</div>
    </section>
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