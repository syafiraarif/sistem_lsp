import React, { useRef, useState, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import axios from "axios";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";

const API_BASE = import.meta.env.VITE_API_BASE;

// ✅ axios instance
const api = axios.create({
  baseURL: API_BASE,
});

// ✅ auto inject token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function ProfileDokumen() {
  const sigRef = useRef(null);

  const [files, setFiles] = useState({});
  const [dataFiles, setDataFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingTTD, setSavingTTD] = useState(false);
  const [refresh, setRefresh] = useState(Date.now());

  /* ================= FETCH ================= */
  const fetchFiles = async () => {
    try {
      const res = await api.get("/asesi/profile/files");
      setDataFiles(res.data?.data || {});
    } catch (err) {
      console.error("FETCH ERROR:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  /* ================= HANDLE FILE ================= */
  const handleFileChange = (e) => {
    const { name, files: selected } = e.target;
    if (!selected || !selected[0]) return;

    setFiles((prev) => ({
      ...prev,
      [name]: selected[0],
    }));
  };

  /* ================= UPLOAD ================= */
  const uploadFiles = async () => {
    if (!Object.keys(files).length) {
      alert("Pilih file dulu");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      Object.entries(files).forEach(([k, v]) => {
        formData.append(k, v);
      });

      const res = await api.put(
        "/asesi/profile/upload-dokumen",
        formData
      );

      console.log("UPLOAD:", res.data);

      alert("Upload berhasil");
      setFiles({});
      fetchFiles();
      setRefresh(Date.now());
    } catch (err) {
      console.error("UPLOAD ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Upload gagal");
    } finally {
      setUploading(false);
    }
  };

  /* ================= TTD ================= */
  const saveTTD = async () => {
    if (!sigRef.current || sigRef.current.isEmpty()) {
      return alert("TTD kosong");
    }

    try {
      setSavingTTD(true);

      const base64 = sigRef.current
        .getCanvas()
        .toDataURL("image/png");

      const res = await api.put("/asesi/profile/upload-ttd", {
        ttd_base64: base64,
      });

      console.log("TTD:", res.data);

      alert("TTD berhasil");
      sigRef.current.clear();
      fetchFiles();
      setRefresh(Date.now());
    } catch (err) {
      console.error("TTD ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Gagal simpan TTD");
    } finally {
      setSavingTTD(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarAsesi />

      <div className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-6">Dokumen & TTD</h2>

        {/* ================= DOKUMEN ================= */}
        <div className="bg-white p-6 rounded shadow mb-10">
          <button
            onClick={uploadFiles}
            className="bg-orange-500 text-white px-4 py-2 rounded mb-4"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>

          {[
            "pas_foto",
            "ktp",
            "ijazah",
            "transkrip",
            "kk",
            "surat_kerja",
            "foto_profil",   // ✅ tambahan
            "portofolio",    // ✅ tambahan
          ].map((f) => (
            <div key={f} className="mb-4">
              <label className="block font-semibold">{f}</label>

              <input
                type="file"
                name={f}
                onChange={handleFileChange}
                className="border p-2 w-full"
              />

              {dataFiles[f] && (
                <a
                  href={`${dataFiles[f]}?t=${refresh}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-500 block"
                >
                  Lihat File
                </a>
              )}
            </div>
          ))}
        </div>

        {/* ================= TTD ================= */}
        <div className="bg-white p-6 rounded shadow">
          <SignatureCanvas
            ref={sigRef}
            penColor="black"
            canvasProps={{
              className: "border w-full h-[200px]",
            }}
          />

          <button
            onClick={saveTTD}
            className="bg-green-600 text-white px-4 py-2 mt-3"
            disabled={savingTTD}
          >
            {savingTTD ? "Saving..." : "Simpan TTD"}
          </button>

          {dataFiles.ttd && (
            <img
              src={`${dataFiles.ttd}?t=${refresh}`}
              className="mt-4 w-40 border"
            />
          )}
        </div>
      </div>
    </div>
  );
}