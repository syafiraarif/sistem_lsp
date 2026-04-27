// frontend/src/pages/asesi/ProfileDokumen.jsx

import React, { useRef, useState, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import axios from "axios";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import {
  Upload,
  FileText,
  Image,
  Loader2,
  PenLine,
  Trash2,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE;

const api = axios.create({
  baseURL: API_BASE,
});

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

  /* ================= FILE ================= */
  const handleFileChange = (e) => {
    const { name, files: selected } = e.target;
    if (!selected || !selected[0]) return;

    setFiles((prev) => ({
      ...prev,
      [name]: selected[0],
    }));
  };

  const uploadFiles = async () => {
    if (!Object.keys(files).length) {
      return alert("Pilih file dulu");
    }

    try {
      setUploading(true);

      const formData = new FormData();
      Object.entries(files).forEach(([k, v]) => {
        formData.append(k, v);
      });

      await api.put("/asesi/profile/upload-dokumen", formData);

      alert("Upload berhasil");
      setFiles({});
      fetchFiles();
      setRefresh(Date.now());
    } catch (err) {
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

      const base64 = sigRef.current.getCanvas().toDataURL("image/png");

      await api.put("/asesi/profile/upload-ttd", {
        ttd_base64: base64,
      });

      alert("TTD berhasil");
      sigRef.current.clear();
      fetchFiles();
      setRefresh(Date.now());
    } catch (err) {
      alert(err.response?.data?.message || "Gagal simpan TTD");
    } finally {
      setSavingTTD(false);
    }
  };

  const clearTTD = () => {
    sigRef.current.clear();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-orange-500" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <SidebarAsesi />

      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">

          {/* HEADER */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-[#071E3D]">
              Dokumen & Tanda Tangan
            </h1>
            <p className="text-slate-500 mt-2">
              Upload dokumen persyaratan dan tanda tangan digital Anda
            </p>
          </div>

          {/* ================= DOKUMEN ================= */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 mb-8">
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-black text-xl text-[#071E3D] flex items-center gap-2">
                <FileText size={20}/> Dokumen Persyaratan
              </h2>

              <button
                onClick={uploadFiles}
                disabled={uploading}
                className="bg-orange-500 hover:bg-[#071E3D] text-white px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2"
              >
                {uploading ? <Loader2 className="animate-spin" size={16}/> : <Upload size={16}/>}
                {uploading ? "Uploading..." : "Upload Semua"}
              </button>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              {[
                "pas_foto",
                "ktp",
                "ijazah",
                "transkrip",
                "kk",
                "surat_kerja",
                "foto_profil",
                "portofolio",
              ].map((f) => (
                <div
                  key={f}
                  className="p-4 border rounded-2xl bg-slate-50 hover:bg-white transition"
                >
                  <label className="block text-sm font-bold text-[#071E3D] mb-2 capitalize">
                    {f.replace("_", " ")}
                  </label>

                  <input
                    type="file"
                    name={f}
                    onChange={handleFileChange}
                    className="w-full text-sm"
                  />

                  {dataFiles[f] && (
                    <a
                      href={`${dataFiles[f]}?t=${refresh}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-orange-500 text-xs mt-2 inline-block"
                    >
                      Lihat File
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ================= TTD ================= */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6">
            
            <h2 className="font-black text-xl text-[#071E3D] mb-6 flex items-center gap-2">
              <PenLine size={20}/> Tanda Tangan Digital
            </h2>

            <div className="border rounded-2xl overflow-hidden">
              <SignatureCanvas
                ref={sigRef}
                penColor="black"
                canvasProps={{
                  className: "w-full h-[220px] bg-white",
                }}
              />
            </div>

            <div className="flex gap-3 mt-4 flex-wrap">
              <button
                onClick={saveTTD}
                disabled={savingTTD}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2"
              >
                {savingTTD ? <Loader2 className="animate-spin" size={16}/> : "💾"}
                Simpan TTD
              </button>

              <button
                onClick={clearTTD}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2"
              >
                <Trash2 size={16}/>
                Hapus
              </button>
            </div>

            {dataFiles.ttd && (
              <div className="mt-6">
                <p className="text-xs font-bold text-slate-400 mb-2 uppercase">
                  TTD Tersimpan
                </p>
                <img
                  src={`${dataFiles.ttd}?t=${refresh}`}
                  className="w-48 border rounded-xl"
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}