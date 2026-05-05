// src/pages/asesor/ProfileAsesor.jsx
import React, { useEffect, useState } from "react";
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
  const [profile, setProfile] = useState(initialProfile);

  const [fotoProfil, setFotoProfil] = useState(null);
  const [ttd, setTtd] = useState(null);

  const [previewFoto, setPreviewFoto] = useState("");
  const [previewTtd, setPreviewTtd] = useState("");

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

      setPreviewFoto(getFileUrl(data.foto_profil));
      setPreviewTtd(getFileUrl(data.ttd_path));
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Gagal mengambil data profil asesor"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

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
        err.response?.data?.message ||
          "Gagal memperbarui profil asesor"
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

  const handleTtdChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setTtd(file);
    setPreviewTtd(URL.createObjectURL(file));
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
      setError(
        err.response?.data?.message ||
          "Gagal upload foto profil"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUploadTtd = async () => {
    if (!ttd) {
      setError("Pilih file tanda tangan terlebih dahulu");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setPesan("");

      const formData = new FormData();
      formData.append("ttd", ttd);

      await api.put("/asesor/profile/upload-ttd", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setPesan("Tanda tangan berhasil disimpan");
      setTtd(null);
      await fetchProfile();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Gagal upload tanda tangan"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Profil Asesor
          </h1>
          <p className="text-sm text-gray-500">
            Kelola data pribadi, foto profil, dan tanda tangan asesor.
          </p>
        </div>

        {pesan && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {pesan}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            Memproses data...
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              Foto Profil
            </h2>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                {previewFoto ? (
                  <img
                    src={previewFoto}
                    alt="Foto Profil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="px-3 text-center text-sm text-gray-500">
                    Belum ada foto
                  </span>
                )}
              </div>

              <div className="flex-1">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleFotoChange}
                  className="mb-3 block w-full text-sm text-gray-700"
                />

                <button
                  type="button"
                  onClick={handleUploadFoto}
                  disabled={loading}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  Upload Foto
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              Tanda Tangan
            </h2>

            <div className="mb-4 flex h-36 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50">
              {previewTtd ? (
                <img
                  src={previewTtd}
                  alt="Tanda Tangan"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <span className="text-sm text-gray-500">
                  Belum ada tanda tangan
                </span>
              )}
            </div>

            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleTtdChange}
              className="mb-3 block w-full text-sm text-gray-700"
            />

            <button
              type="button"
              onClick={handleUploadTtd}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              Upload TTD
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmitProfile}
          className="rounded-xl bg-white p-6 shadow"
        >
          <h2 className="mb-5 text-lg font-semibold text-gray-800">
            Data Profil
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Jenis Kelamin
              </label>
              <select
                name="jenis_kelamin"
                value={profile.jenis_kelamin || ""}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="">Pilih jenis kelamin</option>
                <option value="laki-laki">Laki-laki</option>
                <option value="perempuan">Perempuan</option>
              </select>
            </div>

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

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Status Asesor
              </label>
              <select
                name="status_asesor"
                value={profile.status_asesor || ""}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="">Pilih status</option>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Alamat
              </label>
              <textarea
                name="alamat"
                value={profile.alamat || ""}
                onChange={handleChange}
                rows="3"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
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
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
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
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        maxLength={maxLength}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
        placeholder={`Masukkan ${label.toLowerCase()}`}
      />
    </div>
  );
}