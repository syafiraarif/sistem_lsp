import React, { useEffect, useState } from "react";
import api from "../../services/api";

const ProfileAsesor = () => {
  const [profile, setProfile] = useState({
    nama_lengkap: "",
    no_reg: "",
    no_hp: "",
    email: "",
    alamat: "",
    ttd_path: "",
    foto_profil: "",
  });

  const [fotoProfil, setFotoProfil] = useState(null);
  const [ttd, setTtd] = useState(null);

  const [previewFoto, setPreviewFoto] = useState("");
  const [previewTtd, setPreviewTtd] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const BASE_URL = "http://localhost:3000";

  const getFileUrl = (filePath) => {
    if (!filePath) return "";

    const cleanPath = filePath.replace(/\\/g, "/");

    if (cleanPath.startsWith("http")) {
      return cleanPath;
    }

    return `${BASE_URL}/${cleanPath}`;
  };

  const getProfile = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const res = await api.get("/asesor/profile");

      const data = res.data?.data || res.data || {};

      setProfile({
        nama_lengkap: data.nama_lengkap || "",
        no_reg: data.no_reg || "",
        no_hp: data.no_hp || "",
        email: data.email || "",
        alamat: data.alamat || "",
        ttd_path: data.ttd_path || "",
        foto_profil: data.foto_profil || "",
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
    getProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setMessage("");

      await api.put("/asesor/profile", {
        nama_lengkap: profile.nama_lengkap,
        no_reg: profile.no_reg,
        no_hp: profile.no_hp,
        email: profile.email,
        alamat: profile.alamat,
      });

      setMessage("Profil asesor berhasil diperbarui");
      await getProfile();
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
    const file = e.target.files[0];

    if (!file) return;

    setFotoProfil(file);
    setPreviewFoto(URL.createObjectURL(file));
  };

  const handleTtdChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setTtd(file);
    setPreviewTtd(URL.createObjectURL(file));
  };

  const handleUploadFoto = async () => {
    if (!fotoProfil) {
      setError("Pilih file foto profil terlebih dahulu");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const formData = new FormData();
      formData.append("foto_profil", fotoProfil);

      await api.put("/asesor/profile/upload-foto", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("Foto profil berhasil disimpan");
      setFotoProfil(null);
      await getProfile();
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
      setMessage("");

      const formData = new FormData();
      formData.append("ttd", ttd);

      await api.put("/asesor/profile/upload-ttd", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("Tanda tangan berhasil disimpan");
      setTtd(null);
      await getProfile();
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
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Profil Asesor
          </h1>
          <p className="text-sm text-gray-500">
            Kelola data profil, foto profil, dan tanda tangan asesor.
          </p>
        </div>

        {message && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
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

            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                {previewFoto ? (
                  <img
                    src={previewFoto}
                    alt="Foto Profil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-center text-sm text-gray-500">
                    Belum ada foto
                  </span>
                )}
              </div>

              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
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

            <div className="mb-4 flex h-32 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50">
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
              accept="image/*"
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
          onSubmit={handleUpdateProfile}
          className="rounded-xl bg-white p-6 shadow"
        >
          <h2 className="mb-5 text-lg font-semibold text-gray-800">
            Data Profil
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nama Lengkap
              </label>
              <input
                type="text"
                name="nama_lengkap"
                value={profile.nama_lengkap}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                placeholder="Masukkan nama lengkap"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nomor Registrasi
              </label>
              <input
                type="text"
                name="no_reg"
                value={profile.no_reg}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                placeholder="Masukkan nomor registrasi"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nomor HP
              </label>
              <input
                type="text"
                name="no_hp"
                value={profile.no_hp}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                placeholder="Masukkan nomor HP"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                placeholder="Masukkan email"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Alamat
              </label>
              <textarea
                name="alamat"
                value={profile.alamat}
                onChange={handleChange}
                rows="4"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                placeholder="Masukkan alamat"
              />
            </div>
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
};

export default ProfileAsesor;