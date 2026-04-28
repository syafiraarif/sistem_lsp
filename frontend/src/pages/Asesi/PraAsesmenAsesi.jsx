// frontend/src/pages/asesi/PraAsesmenAsesi.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import {
  Loader2,
  FileText,
  Download,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE;

const api = axios.create({ baseURL: API_BASE });

// inject token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const PraAsesmenAsesi = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [catatan, setCatatan] = useState("");

  const fetchFormData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/asesi/pra-asesmen/form");
      if (!res.data?.data) throw new Error("Data kosong");
      setFormData(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
      setFormData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormData();
  }, []);

  const handleSubmit = async () => {
    if (!formData?.id_peserta) return alert("ID peserta tidak ditemukan");
    if (!formData.ttd_asesi_ready) return alert("TTD belum tersedia");
    if (formData.is_submitted) return alert("Sudah submit");

    try {
      setSubmitting(true);

      const res = await api.post("/asesi/pra-asesmen/submit", {
        id_peserta: formData.id_peserta,
        catatan: catatan || "Hadir",
      });

      alert(res.data?.message || "Berhasil");
      await fetchFormData();
      setCatatan("");
    } catch (err) {
      alert(err.response?.data?.message || "Gagal submit");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-orange-500" size={40} />
      </div>
    );
  }

  if (!formData) {
    return <div className="p-6">Data tidak tersedia</div>;
  }

  const downloadLink = `${API_BASE}/asesi/pra-asesmen/download`;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <SidebarAsesi isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 p-6 lg:p-10">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#071E3D]">
            Pra Asesmen
          </h1>
          <p className="text-gray-500 mt-1">
            Isi presensi sebelum mengikuti asesmen
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50 space-y-6">

          {/* INFO */}
          <Info label="Skema Sertifikasi">
            {formData.skema_sertifikasi?.jenis} - {formData.skema_sertifikasi?.judul}
          </Info>

          <Info label="TUK">
            {formData.tuk?.jenis} - {formData.tuk?.nama}
          </Info>

          <Info label="Nama Asesor">{formData.nama_asesor}</Info>
          <Info label="Nama Asesi">{formData.nama_asesi}</Info>

          <Info label="Jadwal">
            {formData.jadwal_pelaksanaan?.hari_tanggal} - {formData.jadwal_pelaksanaan?.tempat}
          </Info>

          {/* STATUS */}
          <div className="grid grid-cols-2 gap-4">
            <StatusCard
              label="TTD Asesi"
              status={formData.ttd_asesi_ready}
            />
            <StatusCard
              label="Status Submit"
              status={formData.is_submitted}
            />
          </div>

          {/* CATATAN */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700">
              Catatan / Keterangan
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-orange-300"
              rows={3}
              placeholder="Hadir / catatan lainnya"
            />
          </div>

          {/* ACTION */}
          <div className="flex flex-col sm:flex-row gap-4">

            <button
              onClick={handleSubmit}
              disabled={submitting || !formData.ttd_asesi_ready || formData.is_submitted}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-white shadow-lg transition ${
                formData.ttd_asesi_ready && !formData.is_submitted
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {submitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <CheckCircle size={18} />
              )}
              {formData.is_submitted ? "Sudah Submit" : "Submit Presensi"}
            </button>

            <a
              href={downloadLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
            >
              <Download size={18} />
              Download PDF
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};

/* ================= COMPONENT ================= */

const Info = ({ label, children }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-bold text-[#071E3D]">{children || "-"}</p>
  </div>
);

const StatusCard = ({ label, status }) => (
  <div
    className={`p-4 rounded-2xl border flex items-center justify-between ${
      status
        ? "bg-green-50 border-green-200 text-green-700"
        : "bg-red-50 border-red-200 text-red-600"
    }`}
  >
    <span className="font-semibold">{label}</span>
    {status ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
  </div>
);

export default PraAsesmenAsesi;