import React, { useRef, useState, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import axios from "axios";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";

const API_BASE = import.meta.env.VITE_API_BASE;

export default function ProfileDokumen() {
  const sigRef = useRef(null);
  const containerRef = useRef(null);
  const token = localStorage.getItem("token");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [files, setFiles] = useState({});
  const [dataFiles, setDataFiles] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingTTD, setSavingTTD] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  // FIX: Responsive Canvas Logic
  useEffect(() => {
    const resizeCanvas = () => {
      if (sigRef.current && containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        sigRef.current.resize(width, height);
      }
    };

    resizeCanvas(); // Initial size
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/asesi/profile/files`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDataFiles(res.data?.data || null);
    } catch (err) {
      console.error("Fetch files error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFiles((prev) => ({
      ...prev,
      [e.target.name]: e.target.files[0],
    }));
  };

  const uploadFiles = async () => {
    if (Object.keys(files).length === 0) {
      alert("Pilih file dulu");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();

      Object.keys(files).forEach((key) => {
        formData.append(key, files[key]);
      });

      await axios.put(
        `${API_BASE}/asesi/profile/upload-dokumen`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Dokumen berhasil diupload ✅");
      setFiles({});
      fetchFiles();
    } catch (err) {
      console.error(err);
      alert("Upload gagal ❌");
    } finally {
      setUploading(false);
    }
  };

  const clearCanvas = () => {
    sigRef.current?.clear();
  };

  const saveTTD = async () => {
    if (!sigRef.current || sigRef.current.isEmpty()) {
      alert("TTD masih kosong");
      return;
    }

    try {
      setSavingTTD(true);
      const base64 = sigRef.current
        .getTrimmedCanvas()
        .toDataURL("image/png");

      await axios.put(
        `${API_BASE}/asesi/profile/upload-ttd`,
        { ttd_base64: base64 },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("TTD berhasil disimpan ✅");
      sigRef.current.clear();
      fetchFiles();
    } catch (err) {
      console.error(err);
      alert("Gagal simpan TTD ❌");
    } finally {
      setSavingTTD(false);
    }
  };

  if (loading) return <p className="p-10">Loading...</p>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarAsesi isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 p-6 md:p-10">
        {/* HEADER */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-800">
            Upload Dokumen & Tanda Tangan
          </h2>
          <p className="text-gray-500 mt-2">
            Silakan upload dokumen persyaratan dan tanda tangan digital Anda.
          </p>
        </div>

        {/* ======================== DOKUMEN SECTION ======================== */}
        <div className="bg-white rounded-2xl shadow-sm border p-8 mb-10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-semibold text-gray-700">
              Dokumen Persyaratan
            </h3>

            <button
              onClick={uploadFiles}
              disabled={uploading}
              className="bg-orange-500 hover:bg-orange-600 transition text-white px-6 py-3 rounded-xl font-medium shadow-sm"
            >
              {uploading ? "Uploading..." : "Upload Dokumen"}
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "pas_foto",
              "ktp",
              "ijazah",
              "transkrip",
              "kk",
              "surat_kerja",
            ].map((field) => (
              <div
                key={field}
                className="border rounded-xl p-5 bg-gray-50 hover:shadow-md transition duration-200"
              >
                <label className="block text-sm font-semibold text-gray-700 mb-3 capitalize">
                  {field.replace("_", " ")}
                </label>

                <input
                  type="file"
                  name={field}
                  onChange={handleFileChange}
                  className="w-full text-sm border rounded-lg p-2 bg-white"
                />

                {dataFiles?.[field] && (
                  <div className="mt-4">
                    <a
                      href={dataFiles[field]}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Lihat file tersimpan
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ======================== TTD SECTION ======================== */}
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-6">
            Tanda Tangan Digital
          </h3>

          <div
            ref={containerRef}
            className="border-2 border-dashed rounded-xl bg-gray-50 p-4"
          >
            <SignatureCanvas
              ref={sigRef}
              penColor="black"
              backgroundColor="white"
              minWidth={1}
              maxWidth={3}
              canvasProps={{
                className: "w-full h-56 bg-white rounded-lg",
                style: { touchAction: "none" },
              }}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            <button
              onClick={clearCanvas}
              className="bg-gray-400 hover:bg-gray-500 transition text-white px-5 py-2 rounded-lg"
            >
              Clear
            </button>

            <button
              onClick={saveTTD}
              disabled={savingTTD}
              className="bg-green-600 hover:bg-green-700 transition text-white px-5 py-2 rounded-lg"
            >
              {savingTTD ? "Menyimpan..." : "Simpan TTD"}
            </button>
          </div>

          {/* PREVIEW TTD */}
          {dataFiles?.ttd && (
            <div className="mt-10">
              <p className="text-sm font-semibold text-gray-600 mb-3">
                TTD Tersimpan
              </p>

              <div className="inline-block bg-gray-50 border rounded-xl p-4 shadow-sm">
                <img
                  src={dataFiles.ttd}
                  alt="TTD"
                  className="w-64 object-contain"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}