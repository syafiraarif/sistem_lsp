import React, { useEffect, useMemo, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
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

const initialForm = {
  nik: "",
  nama_lengkap: "",
  jenis_kelamin: "",
  tempat_lahir: "",
  tanggal_lahir: "",
  kebangsaan: "",
  pendidikan_terakhir: "",
  universitas: "",
  jurusan: "",
  tahun_lulus: "",
  provinsi_id: "",
  provinsi_nama: "",
  kota_id: "",
  kota_nama: "",
  kecamatan_id: "",
  kecamatan_nama: "",
  kelurahan_id: "",
  kelurahan_nama: "",
  kode_pos: "",
  alamat: "",
  pekerjaan: "",
  jabatan: "",
  nama_perusahaan: "",
  alamat_perusahaan: "",
  telp_perusahaan: "",
  fax_perusahaan: "",
  email_perusahaan: "",
  foto_profil: "",
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

const normalizeList = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.result)) {
    return payload.result;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  return [];
};

export default function ProfileAsesi() {
  const sigRef = useRef(null);
  const fileInputRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [previewTtd, setPreviewTtd] = useState("");
  const [isEditingTtd, setIsEditingTtd] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [refreshKey, setRefreshKey] = useState(Date.now());
  const [provinsiList, setProvinsiList] = useState([]);
  const [kotaList, setKotaList] = useState([]);
  const [kecamatanList, setKecamatanList] = useState([]);
  const [kelurahanList, setKelurahanList] = useState([]);
  const [kebangsaanList, setKebangsaanList] = useState([]);

  const imageBase = API_BASE.replace(/\/api\/?$/, "");
  const totalProfileFields = 23;

  useEffect(() => {
    initPage();

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

    const cleanPath = String(path).replace(/^\/+/, "");
    return `${imageBase}/${cleanPath}`;
  };

  const findByName = (list, name) => {
    if (!name || !Array.isArray(list)) {
      return null;
    }

    return list.find(
      (item) =>
        String(getItemName(item) || "").toLowerCase() ===
        String(name || "").toLowerCase()
    );
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

  const profilePhoto = useMemo(() => {
    return (
      photoPreview ||
      resolveFileUrl(files.foto_profil) ||
      getImageSrc(form?.foto_profil)
    );
  }, [photoPreview, files, form]);

  const ttdUrl = useMemo(() => {
    return (
      resolveFileUrl(files.ttd) ||
      resolveFileUrl(files.tanda_tangan) ||
      getImageSrc(form?.ttd_path) ||
      getImageSrc(form?.ttd)
    );
  }, [files, form]);

  const totalFilled = useMemo(() => {
    const keys = [
      "nik",
      "nama_lengkap",
      "jenis_kelamin",
      "tempat_lahir",
      "tanggal_lahir",
      "kebangsaan",
      "pendidikan_terakhir",
      "universitas",
      "jurusan",
      "tahun_lulus",
      "provinsi_nama",
      "kota_nama",
      "kecamatan_nama",
      "kelurahan_nama",
      "kode_pos",
      "alamat",
      "pekerjaan",
      "jabatan",
      "nama_perusahaan",
      "alamat_perusahaan",
      "telp_perusahaan",
      "fax_perusahaan",
      "email_perusahaan",
    ];

    return keys.filter((key) => Boolean(form?.[key])).length;
  }, [form]);

  const fetchWilayahWithFallback = async ({
    backendPath,
    publicPath,
    errorMessage,
  }) => {
    try {
      const res = await api.get(backendPath);
      return normalizeList(res.data);
    } catch {
      try {
        const publicRes = await publicWilayahApi.get(publicPath);
        return normalizeList(publicRes.data);
      } catch {
        throw new Error(errorMessage);
      }
    }
  };

  const fetchKebangsaan = async () => {
    try {
      const res = await api.get("/public/dropdown/kebangsaan");
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setKebangsaanList(data);
    } catch {
      setKebangsaanList([]);
    }
  };

  const fetchProvinsi = async () => {
    try {
      const list = await fetchWilayahWithFallback({
        backendPath: "/asesi/wilayah/provinsi",
        publicPath: "/provinces.json",
        errorMessage: "Gagal memuat data provinsi.",
      });

      setProvinsiList(list);
      return list;
    } catch (err) {
      setProvinsiList([]);
      throw err;
    }
  };

  const fetchKota = async (provinsiId) => {
    if (!provinsiId) {
      setKotaList([]);
      return [];
    }

    try {
      const list = await fetchWilayahWithFallback({
        backendPath: `/asesi/wilayah/kota/${provinsiId}`,
        publicPath: `/regencies/${provinsiId}.json`,
        errorMessage: "Gagal memuat data kota/kabupaten.",
      });

      setKotaList(list);
      return list;
    } catch (err) {
      setKotaList([]);
      throw err;
    }
  };

  const fetchKecamatan = async (kotaId) => {
    if (!kotaId) {
      setKecamatanList([]);
      return [];
    }

    try {
      const list = await fetchWilayahWithFallback({
        backendPath: `/asesi/wilayah/kecamatan/${kotaId}`,
        publicPath: `/districts/${kotaId}.json`,
        errorMessage: "Gagal memuat data kecamatan.",
      });

      setKecamatanList(list);
      return list;
    } catch (err) {
      setKecamatanList([]);
      throw err;
    }
  };

  const fetchKelurahan = async (kecamatanId) => {
    if (!kecamatanId) {
      setKelurahanList([]);
      return [];
    }

    try {
      const list = await fetchWilayahWithFallback({
        backendPath: `/asesi/wilayah/kelurahan/${kecamatanId}`,
        publicPath: `/villages/${kecamatanId}.json`,
        errorMessage: "Gagal memuat data kelurahan/desa.",
      });

      setKelurahanList(list);
      return list;
    } catch (err) {
      setKelurahanList([]);
      throw err;
    }
  };

  const fetchFiles = async () => {
    try {
      const res = await api.get("/asesi/profile/files");
      setFiles(res.data?.data || {});
    } catch {
      setFiles({});
    }
  };

  const fetchProfile = async (initialProvinsiList = []) => {
    const res = await api.get("/asesi/profile");
    const data = res.data?.data || {};

    let provinsiId = data.provinsi_id || data.id_provinsi || "";
    let provinsiNama = data.provinsi || data.provinsi_nama || "";

    if (!provinsiId && provinsiNama) {
      const foundProv = findByName(initialProvinsiList, provinsiNama);
      provinsiId = getItemId(foundProv);
      provinsiNama = getItemName(foundProv) || provinsiNama;
    }

    let kotaId = data.kota_id || data.id_kota || "";
    let kotaNama = data.kota || data.kota_nama || "";

    if (provinsiId) {
      const kotaResolved = await fetchKota(provinsiId);

      if (!kotaId && kotaNama) {
        const foundKota = findByName(kotaResolved, kotaNama);
        kotaId = getItemId(foundKota);
        kotaNama = getItemName(foundKota) || kotaNama;
      }
    }

    let kecamatanId = data.kecamatan_id || data.id_kecamatan || "";
    let kecamatanNama = data.kecamatan || data.kecamatan_nama || "";

    if (kotaId) {
      const kecamatanResolved = await fetchKecamatan(kotaId);

      if (!kecamatanId && kecamatanNama) {
        const foundKecamatan = findByName(
          kecamatanResolved,
          kecamatanNama
        );
        kecamatanId = getItemId(foundKecamatan);
        kecamatanNama = getItemName(foundKecamatan) || kecamatanNama;
      }
    }

    let kelurahanId = data.kelurahan_id || data.id_kelurahan || "";
    let kelurahanNama = data.kelurahan || data.kelurahan_nama || "";

    if (kecamatanId) {
      const kelurahanResolved = await fetchKelurahan(kecamatanId);

      if (!kelurahanId && kelurahanNama) {
        const foundKelurahan = findByName(
          kelurahanResolved,
          kelurahanNama
        );
        kelurahanId = getItemId(foundKelurahan);
        kelurahanNama = getItemName(foundKelurahan) || kelurahanNama;
      }
    }

    setForm({
      ...initialForm,
      ...data,
      tanggal_lahir: data.tanggal_lahir
        ? String(data.tanggal_lahir).split("T")[0]
        : "",
      tahun_lulus: data.tahun_lulus || "",
      provinsi_id: provinsiId || "",
      provinsi_nama: provinsiNama || "",
      kota_id: kotaId || "",
      kota_nama: kotaNama || "",
      kecamatan_id: kecamatanId || "",
      kecamatan_nama: kecamatanNama || "",
      kelurahan_id: kelurahanId || "",
      kelurahan_nama: kelurahanNama || "",
    });

    const ttdPath =
      data.ttd_path ||
      data.ttd ||
      "";

    setPreviewTtd(resolveFileUrl(ttdPath));
    setIsEditingTtd(!resolveFileUrl(ttdPath));
    setHasSignature(false);
    setRefreshKey(Date.now());
  };

  const initPage = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      await fetchKebangsaan();
      const provList = await fetchProvinsi();
      await fetchProfile(provList);
      await fetchFiles();
    } catch (err) {
      await notifikasi.gagal(
        "Gagal Memuat Profile",
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Gagal memuat data profile asesi."
      );
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
    await initPage();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProvinsiChange = async (event) => {
    const option = event.target.selectedOptions[0];
    const id = event.target.value;
    const name = option?.dataset?.name || "";

    setForm((prev) => ({
      ...prev,
      provinsi_id: id,
      provinsi_nama: name,
      kota_id: "",
      kota_nama: "",
      kecamatan_id: "",
      kecamatan_nama: "",
      kelurahan_id: "",
      kelurahan_nama: "",
    }));

    setKotaList([]);
    setKecamatanList([]);
    setKelurahanList([]);

    if (id) {
      try {
        await fetchKota(id);
      } catch (err) {
        await notifikasi.gagal("Gagal Memuat Kota", err.message);
      }
    }
  };

  const handleKotaChange = async (event) => {
    const option = event.target.selectedOptions[0];
    const id = event.target.value;
    const name = option?.dataset?.name || "";

    setForm((prev) => ({
      ...prev,
      kota_id: id,
      kota_nama: name,
      kecamatan_id: "",
      kecamatan_nama: "",
      kelurahan_id: "",
      kelurahan_nama: "",
    }));

    setKecamatanList([]);
    setKelurahanList([]);

    if (id) {
      try {
        await fetchKecamatan(id);
      } catch (err) {
        await notifikasi.gagal("Gagal Memuat Kecamatan", err.message);
      }
    }
  };

  const handleKecamatanChange = async (event) => {
    const option = event.target.selectedOptions[0];
    const id = event.target.value;
    const name = option?.dataset?.name || "";

    setForm((prev) => ({
      ...prev,
      kecamatan_id: id,
      kecamatan_nama: name,
      kelurahan_id: "",
      kelurahan_nama: "",
    }));

    setKelurahanList([]);

    if (id) {
      try {
        await fetchKelurahan(id);
      } catch (err) {
        await notifikasi.gagal("Gagal Memuat Kelurahan", err.message);
      }
    }
  };

  const handleKelurahanChange = (event) => {
    const option = event.target.selectedOptions[0];
    const id = event.target.value;
    const name = option?.dataset?.name || "";

    setForm((prev) => ({
      ...prev,
      kelurahan_id: id,
      kelurahan_nama: name,
    }));
  };

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

  const startEditTtd = () => {
    setIsEditingTtd(true);
    setHasSignature(false);

    setTimeout(() => {
      sigRef.current?.clear();
    }, 80);
  };

  const clearTtd = () => {
    sigRef.current?.clear();
    setHasSignature(false);
  };

  const cancelEditTtd = () => {
    if (previewTtd) {
      setIsEditingTtd(false);
      setHasSignature(false);
      sigRef.current?.clear();
      return;
    }

    clearTtd();
  };

  const buildPayload = () => {
    const payload = {
      nik: form.nik || null,
      nama_lengkap: form.nama_lengkap || null,
      jenis_kelamin: form.jenis_kelamin
        ? String(form.jenis_kelamin).toLowerCase()
        : null,
      tempat_lahir: form.tempat_lahir || null,
      tanggal_lahir: form.tanggal_lahir || null,
      kebangsaan: form.kebangsaan || null,
      pendidikan_terakhir: form.pendidikan_terakhir || null,
      universitas: form.universitas || null,
      jurusan: form.jurusan || null,
      tahun_lulus: form.tahun_lulus ? Number(form.tahun_lulus) : null,
      provinsi: form.provinsi_nama || null,
      kota: form.kota_nama || null,
      kecamatan: form.kecamatan_nama || null,
      kelurahan: form.kelurahan_nama || null,
      kode_pos: form.kode_pos || null,
      alamat: form.alamat || null,
      pekerjaan: form.pekerjaan || null,
      jabatan: form.jabatan || null,
      nama_perusahaan: form.nama_perusahaan || null,
      alamat_perusahaan: form.alamat_perusahaan || null,
      telp_perusahaan: form.telp_perusahaan || null,
      fax_perusahaan: form.fax_perusahaan || null,
      email_perusahaan: form.email_perusahaan || null,
    };

    Object.keys(payload).forEach((key) => {
      if (payload[key] === "" || payload[key] === undefined) {
        payload[key] = null;
      }
    });

    return payload;
  };

  const uploadFotoProfile = async () => {
    if (!selectedPhoto) {
      return;
    }

    const formData = new FormData();
    formData.append("foto_profil", selectedPhoto);

    await api.put("/asesi/profile/upload-dokumen", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  };

  const uploadTtd = async () => {
    if (!isEditingTtd || !hasSignature || !sigRef.current) {
      return;
    }

    if (sigRef.current.isEmpty()) {
      throw new Error("Tanda tangan belum dibuat.");
    }

    const ttdBase64 = sigRef.current.toDataURL("image/png");

    await api.put("/asesi/profile/upload-ttd", {
      ttd_base64: ttdBase64,
    });
  };

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);

      await api.put("/asesi/profile", buildPayload());

      if (selectedPhoto) {
        await uploadFotoProfile();
      }

      if (isEditingTtd && hasSignature) {
        await uploadTtd();
      }

      setSelectedPhoto(null);

      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }

      setPhotoPreview("");

      await fetchFiles();

      const provList = provinsiList.length
        ? provinsiList
        : await fetchProvinsi();

      await fetchProfile(provList);

      if (sigRef.current) {
        sigRef.current.clear();
      }

      setHasSignature(false);

      await notifikasi.sukses(
        "Berhasil",
        "Data profile asesi berhasil disimpan."
      );
    } catch (err) {
      await notifikasi.gagal(
        "Gagal Menyimpan Profile",
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Gagal menyimpan data profile asesi."
      );
    } finally {
      setSaving(false);
    }
  };

  const displayName =
    form.nama_lengkap ||
    form.nama ||
    form.username ||
    "Asesi";

  const progressPercentage = Math.min(
    (totalFilled / totalProfileFields) * 100,
    100
  );

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <SidebarAsesi isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-[1500px] space-y-5">
          <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
            <div className="border-b border-[#071E3D]/10 px-5 py-5 md:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="mb-3 h-1 w-10 rounded-full bg-[#CC6B27]" />
                  <h1 className="text-[24px] font-black text-[#071E3D] md:text-[28px]">
                    Data Profile {displayName}
                  </h1>
                  <p className="mt-1 max-w-3xl text-[13px] font-medium leading-5 text-[#182D4A]/70">
                    Kelola identitas, pendidikan, alamat, pekerjaan, foto
                    profile, dan tanda tangan digital asesi.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing || saving}
                  className="rounded-lg border border-[#071E3D]/20 bg-white px-4 py-2.5 text-[12px] font-bold text-[#071E3D] shadow-sm transition-all hover:border-[#071E3D] hover:bg-[#071E3D] hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <span className="flex items-center justify-center gap-2">
                    {refreshing ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <RefreshCcw size={15} />
                    )}
                    Refresh
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3 md:p-6">
              <ProfileStat
                icon={<User size={21} />}
                label="Nama Asesi"
                value={displayName}
              />
              <ProfileStat
                icon={<Hash size={21} />}
                label="NIK"
                value={form.nik || "Belum tersedia"}
              />
              <ProfileStat
                icon={<BadgeCheck size={21} />}
                label="Progress Profile"
                value={`${totalFilled}/${totalProfileFields} Terisi`}
              />
            </div>
          </section>

          <form onSubmit={handleSave} className="space-y-5">
            <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
                <div className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-5 py-3.5">
                  <h2 className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-white">
                    <Camera size={17} className="text-[#CC6B27]" />
                    Foto Profil
                  </h2>
                </div>

                <div className="border-b border-[#071E3D]/10 px-5 py-3">
                  <p className="text-[12px] font-medium text-[#182D4A]/60">
                    Foto resmi asesi yang digunakan sebagai identitas profile.
                  </p>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-[180px_1fr] md:items-center">
                    <div className="h-[210px] overflow-hidden rounded-lg border border-[#071E3D]/10 bg-[#FAFAFA]">
                      {profilePhoto ? (
                        <img
                          src={`${profilePhoto}${profilePhoto.includes("?") ? "&" : "?"}t=${refreshKey}`}
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
                              Silakan pilih foto profile.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        className="hidden"
                        onChange={handlePhotoSelect}
                      />

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={saving}
                        className="rounded-lg border border-dashed border-[#CC6B27]/40 bg-[#CC6B27]/5 p-5 text-left transition-all hover:border-[#CC6B27] hover:bg-[#CC6B27]/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <div className="flex items-center gap-4">
                          <div className="rounded-lg bg-white p-3 text-[#CC6B27] shadow-sm">
                            <UploadCloud size={22} />
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-[#071E3D]">
                              Pilih Foto Profil
                            </p>
                            <p className="mt-1 text-[11px] font-medium text-[#182D4A]/60">
                              PNG, JPG, JPEG, atau WEBP. Maksimal 2 MB.
                            </p>
                          </div>
                        </div>
                      </button>

                      {selectedPhoto && (
                        <div className="rounded-lg border border-[#CC6B27]/20 bg-[#CC6B27]/5 px-4 py-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold text-[#071E3D]">
                                Foto baru siap disimpan
                              </p>
                              <p className="mt-1 truncate text-[11px] font-medium text-[#182D4A]/60">
                                {selectedPhoto.name}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={clearSelectedPhoto}
                              className="shrink-0 rounded-lg border border-[#071E3D]/10 bg-white p-2 text-[#071E3D] transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            >
                              <Eraser size={14} />
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <SmallInfoCard
                          label="Status Foto"
                          value={
                            profilePhoto
                              ? "Sudah tersedia"
                              : "Belum tersedia"
                          }
                        />
                        <SmallInfoCard
                          label="Format"
                          value="PNG, JPG, WEBP"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
                <div className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-5 py-3.5">
                  <h2 className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-white">
                    <FileSignature size={17} className="text-[#CC6B27]" />
                    Tanda Tangan Digital
                  </h2>
                </div>

                <div className="border-b border-[#071E3D]/10 px-5 py-3">
                  <p className="text-[12px] font-medium text-[#182D4A]/60">
                    Tanda tangan yang digunakan pada dokumen asesi.
                  </p>
                </div>

                <div className="p-5">
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-[13px] font-bold text-[#071E3D]">
                        {isEditingTtd ? "Area Tanda Tangan" : "TTD Tersimpan"}
                      </p>
                      <p className="mt-1 text-[11px] font-medium text-[#182D4A]/60">
                        {isEditingTtd
                          ? "Gunakan mouse, trackpad, atau layar sentuh."
                          : "Tanda tangan digital yang tersimpan pada profile."}
                      </p>
                    </div>

                    {!isEditingTtd && (
                      <button
                        type="button"
                        onClick={startEditTtd}
                        className="rounded-lg border border-[#CC6B27]/40 bg-white px-4 py-2 text-[11px] font-bold text-[#CC6B27] transition-all hover:border-[#CC6B27] hover:bg-[#CC6B27] hover:text-white"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <PenLine size={14} />
                          Ganti TTD
                        </span>
                      </button>
                    )}
                  </div>

                  {isEditingTtd ? (
                    <div className="overflow-hidden rounded-lg border border-[#071E3D]/10 bg-white">
                      {!hasSignature && (
                        <div className="pointer-events-none absolute" />
                      )}
                      <SignatureCanvas
                        ref={sigRef}
                        penColor="#071E3D"
                        minWidth={1}
                        maxWidth={2.5}
                        canvasProps={{
                          className:
                            "h-[235px] w-full cursor-crosshair bg-white touch-none",
                        }}
                        onBegin={() => setHasSignature(true)}
                      />
                    </div>
                  ) : (
                    <div className="flex h-[235px] items-center justify-center overflow-hidden rounded-lg border border-[#071E3D]/10 bg-[#FAFAFA]">
                      {ttdUrl ? (
                        <img
                          src={`${ttdUrl}${ttdUrl.includes("?") ? "&" : "?"}t=${refreshKey}`}
                          alt="Tanda Tangan"
                          className="max-h-full max-w-full object-contain p-8"
                        />
                      ) : (
                        <div className="text-center">
                          <PenLine
                            size={30}
                            className="mx-auto mb-3 text-[#CC6B27]"
                          />
                          <p className="text-[13px] font-bold text-[#071E3D]">
                            Tanda Tangan Belum Tersedia
                          </p>
                          <p className="mt-1 text-[11px] font-medium text-[#182D4A]/60">
                            Buat tanda tangan melalui area pengeditan.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {isEditingTtd && (
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={clearTtd}
                        className="rounded-lg border border-[#071E3D]/20 bg-white px-4 py-2.5 text-[12px] font-bold text-[#071E3D] transition-all hover:border-[#071E3D] hover:bg-[#071E3D] hover:text-white"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <RotateCcw size={15} />
                          Bersihkan
                        </span>
                      </button>

                      {previewTtd && (
                        <button
                          type="button"
                          onClick={cancelEditTtd}
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
                  <ShieldCheck size={17} className="text-[#CC6B27]" />
                  Status Profile
                </h2>
              </div>

              <div className="p-5 md:p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px] md:items-center">
                  <div>
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#182D4A]/60">
                          Kelengkapan Data
                        </p>
                        <p className="mt-1 text-[28px] font-black text-[#071E3D]">
                          {totalFilled}
                          <span className="text-[#182D4A]/30">
                            /{totalProfileFields}
                          </span>
                        </p>
                      </div>

                      <p className="text-[12px] font-bold text-[#CC6B27]">
                        {Math.round(progressPercentage)}%
                      </p>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-[#CC6B27] transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>

                    <p className="mt-3 text-[11px] font-medium leading-5 text-[#182D4A]/60">
                      Lengkapi data profile agar informasi administrasi asesi
                      dapat digunakan dalam proses sertifikasi.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <SmallInfoCard
                      label="Data Pribadi"
                      value={
                        form.nama_lengkap && form.nik
                          ? "Lengkap"
                          : "Perlu Dilengkapi"
                      }
                    />
                    <SmallInfoCard
                      label="Alamat"
                      value={
                        form.provinsi_nama && form.kota_nama
                          ? "Lengkap"
                          : "Perlu Dilengkapi"
                      }
                    />
                  </div>
                </div>
              </div>
            </section>

            <ProfileSection
              title="Informasi Identitas"
              subtitle="Lengkapi data identitas pribadi asesi."
              icon={<User size={17} />}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Input
                  label="Nama Lengkap"
                  name="nama_lengkap"
                  form={form}
                  handleChange={handleChange}
                  placeholder="Nama lengkap"
                />
                <Input
                  label="NIK"
                  name="nik"
                  form={form}
                  handleChange={handleChange}
                  placeholder="16 digit NIK"
                  maxLength={16}
                  inputMode="numeric"
                />
                <SelectJenisKelamin
                  label="Jenis Kelamin"
                  name="jenis_kelamin"
                  form={form}
                  handleChange={handleChange}
                />
                <Input
                  label="Tempat Lahir"
                  name="tempat_lahir"
                  form={form}
                  handleChange={handleChange}
                  placeholder="Tempat lahir"
                />
                <Input
                  label="Tanggal Lahir"
                  name="tanggal_lahir"
                  type="date"
                  form={form}
                  handleChange={handleChange}
                />
                <SelectKebangsaan
                  label="Kebangsaan"
                  name="kebangsaan"
                  form={form}
                  handleChange={handleChange}
                  list={kebangsaanList}
                />
              </div>
            </ProfileSection>

            <ProfileSection
              title="Pendidikan"
              subtitle="Informasi pendidikan terakhir dan institusi asal."
              icon={<GraduationCap size={17} />}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <SelectPendidikanTerakhir
                  label="Pendidikan Terakhir"
                  name="pendidikan_terakhir"
                  form={form}
                  handleChange={handleChange}
                />
                <Input
                  label="Universitas / Sekolah"
                  name="universitas"
                  form={form}
                  handleChange={handleChange}
                  placeholder="Nama universitas atau sekolah"
                />
                <Input
                  label="Jurusan"
                  name="jurusan"
                  form={form}
                  handleChange={handleChange}
                  placeholder="Contoh: Teknologi Informasi"
                />
                <Input
                  label="Tahun Lulus"
                  name="tahun_lulus"
                  type="number"
                  form={form}
                  handleChange={handleChange}
                  placeholder="Contoh: 2024"
                />
              </div>
            </ProfileSection>

            <ProfileSection
              title="Alamat"
              subtitle="Lengkapi alamat tempat tinggal sesuai data profile."
              icon={<MapPin size={17} />}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <SelectWilayah
                  label="Provinsi"
                  list={provinsiList}
                  value={form.provinsi_id}
                  onChange={handleProvinsiChange}
                />
                <SelectWilayah
                  label="Kota / Kabupaten"
                  list={kotaList}
                  value={form.kota_id}
                  onChange={handleKotaChange}
                  disabled={!form.provinsi_id}
                />
                <SelectWilayah
                  label="Kecamatan"
                  list={kecamatanList}
                  value={form.kecamatan_id}
                  onChange={handleKecamatanChange}
                  disabled={!form.kota_id}
                />
                <SelectWilayah
                  label="Kelurahan / Desa"
                  list={kelurahanList}
                  value={form.kelurahan_id}
                  onChange={handleKelurahanChange}
                  disabled={!form.kecamatan_id}
                />
                <Input
                  label="Kode Pos"
                  name="kode_pos"
                  form={form}
                  handleChange={handleChange}
                  placeholder="Contoh: 55183"
                  maxLength={5}
                  inputMode="numeric"
                />
                <div className="md:col-span-2 xl:col-span-4">
                  <TextArea
                    label="Alamat Lengkap"
                    name="alamat"
                    form={form}
                    handleChange={handleChange}
                    placeholder="Masukkan alamat lengkap"
                  />
                </div>
              </div>
            </ProfileSection>

            <ProfileSection
              title="Pekerjaan"
              subtitle="Informasi pekerjaan atau aktivitas profesional asesi."
              icon={<BriefcaseBusiness size={17} />}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Input
                  label="Pekerjaan"
                  name="pekerjaan"
                  form={form}
                  handleChange={handleChange}
                  placeholder="Pekerjaan saat ini"
                />
                <Input
                  label="Jabatan"
                  name="jabatan"
                  form={form}
                  handleChange={handleChange}
                  placeholder="Jabatan"
                />
                <Input
                  label="Nama Perusahaan"
                  name="nama_perusahaan"
                  form={form}
                  handleChange={handleChange}
                  placeholder="Nama perusahaan"
                />
                <Input
                  label="Telepon Perusahaan"
                  name="telp_perusahaan"
                  form={form}
                  handleChange={handleChange}
                  placeholder="Nomor telepon"
                />
                <Input
                  label="Fax Perusahaan"
                  name="fax_perusahaan"
                  form={form}
                  handleChange={handleChange}
                  placeholder="Nomor fax jika ada"
                />
                <Input
                  label="Email Perusahaan"
                  name="email_perusahaan"
                  type="email"
                  form={form}
                  handleChange={handleChange}
                  placeholder="email@perusahaan.com"
                />
                <div className="md:col-span-2 xl:col-span-3">
                  <TextArea
                    label="Alamat Perusahaan"
                    name="alamat_perusahaan"
                    form={form}
                    handleChange={handleChange}
                    placeholder="Alamat lengkap perusahaan"
                  />
                </div>
              </div>
            </ProfileSection>

            <section className="flex flex-col gap-3 overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="px-5 py-4 md:px-6">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#182D4A]/50">
                  Simpan Profile
                </p>
                <p className="mt-1 text-[12px] font-medium leading-relaxed text-[#182D4A]/60">
                  Pastikan seluruh data, foto profile, dan tanda tangan sudah
                  benar sebelum disimpan.
                </p>
              </div>

              <div className="px-5 pb-4 sm:pb-0 md:px-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-lg bg-[#CC6B27] px-5 py-3 text-[12px] font-bold text-white shadow-sm transition-all hover:bg-[#A8561F] disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
                >
                  <span className="flex items-center justify-center gap-2">
                    {saving ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Save size={15} />
                    )}
                    {saving ? "Menyimpan..." : "Simpan Profile"}
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

function ProfileSection({ title, subtitle, icon, children }) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
      <div className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-5 py-3.5 md:px-6">
        <h2 className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-white">
          <span className="text-[#CC6B27]">{icon}</span>
          {title}
        </h2>
      </div>
      <div className="border-b border-[#071E3D]/10 bg-white px-5 py-3 md:px-6">
        <p className="text-[12px] font-medium text-[#182D4A]/60">{subtitle}</p>
      </div>
      <div className="p-5 md:p-6">{children}</div>
    </section>
  );
}

function ProfileStat({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#071E3D]/10 bg-white p-4 shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#182D4A]/60">
          {label}
        </p>
        <p className="mt-1 truncate text-[15px] font-black text-[#071E3D]">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

function SmallInfoCard({ label, value }) {
  return (
    <div className="rounded-lg border border-[#071E3D]/10 bg-[#FAFAFA] p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#182D4A]/60">
        {label}
      </p>
      <p className="mt-1 text-[12px] font-bold text-[#071E3D]">{value}</p>
    </div>
  );
}

function Input({
  label,
  name,
  type = "text",
  form,
  handleChange,
  placeholder = "",
  maxLength,
  inputMode,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-bold text-[#071E3D]">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={form?.[name] || ""}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={maxLength}
        inputMode={inputMode}
        className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-3.5 py-3 text-[13px] font-medium text-[#071E3D] outline-none transition-all placeholder:text-[#182D4A]/40 focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
      />
    </div>
  );
}

function TextArea({
  label,
  name,
  form,
  handleChange,
  placeholder = "",
  rows = 4,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-bold text-[#071E3D]">
        {label}
      </label>
      <textarea
        name={name}
        value={form?.[name] || ""}
        onChange={handleChange}
        rows={rows}
        placeholder={placeholder}
        className="w-full resize-none rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-3.5 py-3 text-[13px] font-medium text-[#071E3D] outline-none transition-all placeholder:text-[#182D4A]/40 focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
      />
    </div>
  );
}

function SelectJenisKelamin({ label, name, form, handleChange }) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-bold text-[#071E3D]">
        {label}
      </label>
      <select
        name={name}
        value={form?.[name] || ""}
        onChange={handleChange}
        className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-3.5 py-3 text-[13px] font-medium text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
      >
        <option value="">Pilih Jenis Kelamin</option>
        <option value="laki-laki">Laki-laki</option>
        <option value="perempuan">Perempuan</option>
      </select>
    </div>
  );
}

function SelectPendidikanTerakhir({ label, name, form, handleChange }) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-bold text-[#071E3D]">
        {label}
      </label>
      <select
        name={name}
        value={form?.[name] || ""}
        onChange={handleChange}
        className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-3.5 py-3 text-[13px] font-medium text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
      >
        <option value="">Pilih Pendidikan Terakhir</option>
        <option value="SD">SD</option>
        <option value="SMP">SMP</option>
        <option value="SMA/SMK">SMA/SMK</option>
        <option value="D3">D3</option>
        <option value="D4">D4</option>
        <option value="S1">S1</option>
        <option value="S2">S2</option>
        <option value="S3">S3</option>
      </select>
    </div>
  );
}

function SelectKebangsaan({ label, name, form, handleChange, list }) {
  const safeList = Array.isArray(list) ? list : [];

  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-bold text-[#071E3D]">
        {label}
      </label>
      <select
        name={name}
        value={form?.[name] || ""}
        onChange={handleChange}
        className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-3.5 py-3 text-[13px] font-medium text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
      >
        <option value="">Pilih Kebangsaan</option>
        {safeList.map((item, index) => (
          <option key={`${item.value || item.id || index}-${index}`} value={item.value || item.label || item.name || ""}>
            {item.label || item.name || item.value || "-"}
          </option>
        ))}
      </select>
    </div>
  );
}

function SelectWilayah({ label, list, value, onChange, disabled = false }) {
  const safeList = Array.isArray(list) ? list : [];

  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-bold text-[#071E3D]">
        {label}
      </label>
      <select
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        className={`w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-3.5 py-3 text-[13px] font-medium text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10 ${
          disabled ? "cursor-not-allowed opacity-50" : ""
        }`}
      >
        <option value="">Pilih {label}</option>
        {safeList.map((item, index) => {
          const id = getItemId(item);
          const name = getItemName(item);

          return (
            <option key={`${id}-${index}`} value={id} data-name={name}>
              {name || "-"}
            </option>
          );
        })}
      </select>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
      <div className="flex items-center gap-4 rounded-xl border border-[#071E3D]/10 bg-white p-8 shadow-sm">
        <Loader2 size={26} className="animate-spin text-[#CC6B27]" />
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