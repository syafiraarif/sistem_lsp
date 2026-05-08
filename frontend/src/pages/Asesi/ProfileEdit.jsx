// frontend/src/pages/asesi/ProfileEdit.jsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import {
  AlertCircle,
  BadgeCheck,
  BriefcaseBusiness,
  ChevronRight,
  Eraser,
  GraduationCap,
  Hash,
  ImagePlus,
  Loader2,
  MapPin,
  RefreshCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Upload,
  User,
  CheckCircle,
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

export default function ProfileEdit() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({});
  const [files, setFiles] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [provinsiList, setProvinsiList] = useState([]);
  const [kotaList, setKotaList] = useState([]);
  const [kecamatanList, setKecamatanList] = useState([]);
  const [kelurahanList, setKelurahanList] = useState([]);

  const imageBase = API_BASE.replace("/api", "");
  const totalProfileFields = 22;

  useEffect(() => {
    initPage();

    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
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

  const profilePhoto = useMemo(() => {
    return (
      photoPreview ||
      resolveFileUrl(files.foto_profil) ||
      getImageSrc(form?.foto_profil)
    );
  }, [photoPreview, files, form]);

  const findByName = (list, name) => {
    if (!name || !Array.isArray(list)) return null;

    return list.find(
      (item) =>
        String(getItemName(item) || "").toLowerCase() ===
        String(name || "").toLowerCase()
    );
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

  const initPage = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const provList = await fetchProvinsi();
      await fetchProfile(provList);
      await fetchFiles();
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal memuat data profile.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setSelectedPhoto(null);
    setPhotoPreview("");
    await initPage();
  };

  const fetchFiles = async () => {
    try {
      const res = await api.get("/asesi/profile/files");
      setFiles(res.data?.data || {});
    } catch (err) {
      console.error("Fetch files error:", err);
      setFiles({});
    }
  };

  const fetchProfile = async (initialProvinsiList = []) => {
    try {
      setError("");

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
          const foundKec = findByName(kecamatanResolved, kecamatanNama);
          kecamatanId = getItemId(foundKec);
          kecamatanNama = getItemName(foundKec) || kecamatanNama;
        }
      }

      let kelurahanId = data.kelurahan_id || data.id_kelurahan || "";
      let kelurahanNama = data.kelurahan || data.kelurahan_nama || "";

      if (kecamatanId) {
        const kelurahanResolved = await fetchKelurahan(kecamatanId);

        if (!kelurahanId && kelurahanNama) {
          const foundKel = findByName(kelurahanResolved, kelurahanNama);
          kelurahanId = getItemId(foundKel);
          kelurahanNama = getItemName(foundKel) || kelurahanNama;
        }
      }

      setForm({
        ...data,

        tanggal_lahir: data.tanggal_lahir
          ? String(data.tanggal_lahir).split("T")[0]
          : "",

        provinsi_id: provinsiId || "",
        provinsi_nama: provinsiNama || "",

        kota_id: kotaId || "",
        kota_nama: kotaNama || "",

        kecamatan_id: kecamatanId || "",
        kecamatan_nama: kecamatanNama || "",

        kelurahan_id: kelurahanId || "",
        kelurahan_nama: kelurahanNama || "",
      });
    } catch (err) {
      console.error("Fetch profile error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Gagal mengambil data profile."
      );
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
      setError(err.message);
      return [];
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
      setError(err.message);
      return [];
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
      setError(err.message);
      return [];
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
      setError(err.message);
      return [];
    }
  };

  const resetMessage = () => {
    setError("");
    setSuccess("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    resetMessage();

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProvinsiChange = async (e) => {
    const selectedOption = e.target.selectedOptions[0];
    const id = e.target.value;
    const name = selectedOption?.dataset?.name || "";

    resetMessage();

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

    if (id) await fetchKota(id);
  };

  const handleKotaChange = async (e) => {
    const selectedOption = e.target.selectedOptions[0];
    const id = e.target.value;
    const name = selectedOption?.dataset?.name || "";

    resetMessage();

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

    if (id) await fetchKecamatan(id);
  };

  const handleKecamatanChange = async (e) => {
    const selectedOption = e.target.selectedOptions[0];
    const id = e.target.value;
    const name = selectedOption?.dataset?.name || "";

    resetMessage();

    setForm((prev) => ({
      ...prev,
      kecamatan_id: id,
      kecamatan_nama: name,
      kelurahan_id: "",
      kelurahan_nama: "",
    }));

    setKelurahanList([]);

    if (id) await fetchKelurahan(id);
  };

  const handleKelurahanChange = (e) => {
    const selectedOption = e.target.selectedOptions[0];
    const id = e.target.value;
    const name = selectedOption?.dataset?.name || "";

    resetMessage();

    setForm((prev) => ({
      ...prev,
      kelurahan_id: id,
      kelurahan_nama: name,
    }));
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];

    resetMessage();

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Foto profile harus berupa JPG, PNG, JPEG, atau WEBP.");
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

  const uploadFotoProfile = async ({ silent = false } = {}) => {
    if (!selectedPhoto) return false;

    const formData = new FormData();
    formData.append("foto_profil", selectedPhoto);

    await api.put("/asesi/profile/upload-dokumen", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    await fetchFiles();

    clearSelectedPhoto();

    if (!silent) {
      setSuccess("Foto profile berhasil diperbarui.");
    }

    return true;
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

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = buildPayload();

      await api.put("/asesi/profile", payload);

      if (selectedPhoto) {
        await uploadFotoProfile({ silent: true });
      }

      setSuccess("Profil berhasil disimpan.");

      const provList = provinsiList.length
        ? provinsiList
        : await fetchProvinsi();

      await fetchProfile(provList);
      await fetchFiles();
    } catch (err) {
      console.error("Update profile error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Gagal menyimpan data."
      );
    } finally {
      setSaving(false);
    }
  };

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
      "email_perusahaan",
    ];

    return keys.filter((key) => Boolean(form?.[key])).length;
  }, [form]);

  if (loading) {
    return <LoadingScreen />;
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
                    Edit Profile Asesi
                  </span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-black leading-tight text-[#071E3D]">
                  Edit Profile
                  <br />
                  <span className="text-orange-500">Lengkap</span>
                </h1>

                <p className="mt-5 max-w-2xl text-base lg:text-lg font-medium leading-relaxed text-slate-500">
                  Perbarui data diri, pendidikan, alamat, pekerjaan, dan foto
                  profile agar data sertifikasi Anda tetap lengkap.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {saving ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <Save size={17} />
                    )}
                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
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
                    disabled={refreshing || saving}
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
                    Progress Profile
                  </p>

                  <h2 className="text-2xl font-black leading-tight">
                    {totalFilled}/{totalProfileFields} Data Terisi
                  </h2>

                  <p className="mt-4 text-sm font-medium leading-relaxed text-white/60">
                    Semakin lengkap data profile, semakin mudah proses asesmen
                    dan verifikasi administrasi.
                  </p>

                  <div className="mt-auto pt-6 grid grid-cols-2 gap-3">
                    <HeroPill label="Role" value="Asesi" />
                    <HeroPill
                      label="Foto"
                      value={profilePhoto ? "Ada" : "Belum"}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {error && <AlertMessage type="error" text={error} />}
          {success && <AlertMessage type="success" text={success} />}

          <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <MiniStat
              icon={<User size={22} />}
              label="Nama Lengkap"
              value={form.nama_lengkap || "-"}
            />

            <MiniStat
              icon={<Hash size={22} />}
              label="NIK"
              value={form.nik || "-"}
            />

            <MiniStat
              icon={<BadgeCheck size={22} />}
              label="Data Profile"
              value={`${totalFilled}/${totalProfileFields} Terisi`}
            />
          </section>

          <DataDiriCard
            form={form}
            handleChange={handleChange}
            profilePhoto={profilePhoto}
            selectedPhoto={selectedPhoto}
            fileInputRef={fileInputRef}
            handlePhotoSelect={handlePhotoSelect}
            clearSelectedPhoto={clearSelectedPhoto}
            uploadFotoProfile={uploadFotoProfile}
            saving={saving}
          />

          <Card title="Pendidikan" icon={<GraduationCap size={22} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
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
                placeholder="Nama universitas/sekolah"
              />

              <Input
                label="Jurusan"
                name="jurusan"
                form={form}
                handleChange={handleChange}
                placeholder="Contoh: Hukum"
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
          </Card>

          <Card title="Alamat" icon={<MapPin size={22} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              <SelectWilayah
                label="Provinsi"
                list={provinsiList}
                value={form.provinsi_id}
                onChange={handleProvinsiChange}
              />

              <SelectWilayah
                label="Kota/Kabupaten"
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
                label="Kelurahan/Desa"
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
          </Card>

          <Card title="Pekerjaan" icon={<BriefcaseBusiness size={22} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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
                label="Fax Perusahaan (Opsional)"
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

              <div className="xl:col-span-3">
                <TextArea
                  label="Alamat Perusahaan"
                  name="alamat_perusahaan"
                  form={form}
                  handleChange={handleChange}
                  placeholder="Alamat lengkap perusahaan"
                />
              </div>
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/asesi/profile")}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-[#071E3D] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:bg-[#071E3D] hover:text-white"
            >
              Lihat Profile
              <ChevronRight size={17} />
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-orange-500 hover:bg-[#071E3D] text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function DataDiriCard({
  form,
  handleChange,
  profilePhoto,
  selectedPhoto,
  fileInputRef,
  handlePhotoSelect,
  clearSelectedPhoto,
  uploadFotoProfile,
  saving,
}) {
  const [uploading, setUploading] = useState(false);

  const handleUploadOnly = async () => {
    try {
      setUploading(true);
      await uploadFotoProfile();
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Gagal mengupload foto profile."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
          <User size={22} />
        </div>

        <div>
          <h2 className="text-xl font-black text-[#071E3D]">Data Diri</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            Edit Profile
          </p>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 xl:grid-cols-[250px_1fr] gap-5 items-start">
          <div className="space-y-4">
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
              disabled={saving || uploading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              <ImagePlus size={16} />
              Pilih Foto
            </button>

            {selectedPhoto && (
              <div className="rounded-[24px] border border-orange-100 bg-orange-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  Foto Baru
                </p>

                <p className="mt-1 text-sm font-black text-[#071E3D] break-words">
                  {selectedPhoto.name}
                </p>

                <div className="mt-4 grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={handleUploadOnly}
                    disabled={uploading || saving}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#071E3D] px-4 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-orange-500 disabled:bg-slate-300 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Upload size={15} />
                    )}
                    Upload Foto Saja
                  </button>

                  <button
                    type="button"
                    onClick={clearSelectedPhoto}
                    disabled={uploading || saving}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs font-black uppercase tracking-widest text-red-500 border border-red-100 hover:bg-red-50 disabled:opacity-60"
                  >
                    <Eraser size={15} />
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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

            <Input
              label="Kebangsaan"
              name="kebangsaan"
              form={form}
              handleChange={handleChange}
              placeholder="Contoh: Indonesia"
            />
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
        <CheckCircle size={20} className="shrink-0 mt-0.5" />
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
            Edit Profile
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

function Input({
  label,
  name,
  type = "text",
  form,
  handleChange,
  placeholder = "",
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 ml-1">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={form?.[name] || ""}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full rounded-[22px] border border-slate-100 bg-slate-50/70 px-5 py-4 text-sm font-black text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
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
    <div className="flex flex-col gap-2.5">
      <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 ml-1">
        {label}
      </label>

      <textarea
        name={name}
        value={form?.[name] || ""}
        onChange={handleChange}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-[22px] border border-slate-100 bg-slate-50/70 px-5 py-4 text-sm font-black text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10 resize-none"
      />
    </div>
  );
}

function SelectPendidikanTerakhir({ label, name, form, handleChange }) {
  return (
    <div className="flex flex-col gap-2.5">
      <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 ml-1">
        {label}
      </label>

      <div className="relative">
        <select
          name={name}
          value={form?.[name] || ""}
          onChange={handleChange}
          className="w-full appearance-none rounded-[22px] border border-slate-100 bg-slate-50/70 px-5 py-4 pr-12 text-sm font-black text-[#071E3D] outline-none transition-all focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
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

        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <ChevronRight size={18} className="rotate-90" />
        </div>
      </div>
    </div>
  );
}

function SelectJenisKelamin({ label, name, form, handleChange }) {
  return (
    <div className="flex flex-col gap-2.5">
      <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 ml-1">
        {label}
      </label>

      <div className="relative">
        <select
          name={name}
          value={form?.[name] || ""}
          onChange={handleChange}
          className="w-full appearance-none rounded-[22px] border border-slate-100 bg-slate-50/70 px-5 py-4 pr-12 text-sm font-black text-[#071E3D] outline-none transition-all focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
        >
          <option value="">Pilih Jenis Kelamin</option>
          <option value="laki-laki">Laki-laki</option>
          <option value="perempuan">Perempuan</option>
        </select>

        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <ChevronRight size={18} className="rotate-90" />
        </div>
      </div>
    </div>
  );
}

function SelectWilayah({ label, list, value, onChange, disabled }) {
  const safeList = Array.isArray(list) ? list : [];

  return (
    <div className="flex flex-col gap-2.5">
      <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 ml-1">
        {label}
      </label>

      <div className="relative">
        <select
          value={value || ""}
          onChange={onChange}
          disabled={disabled}
          className={`w-full appearance-none rounded-[22px] border border-slate-100 bg-slate-50/70 px-5 py-4 pr-12 text-sm font-black text-[#071E3D] outline-none transition-all focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10 ${
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          <option value="">Pilih {label}</option>

          {safeList.map((item, index) => {
            const id = getItemId(item);
            const name = getItemName(item);

            return (
              <option key={`${id}-${index}`} value={id} data-name={name}>
                {name}
              </option>
            );
          })}
        </select>

        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <ChevronRight size={18} className="rotate-90" />
        </div>
      </div>
    </div>
  );
}