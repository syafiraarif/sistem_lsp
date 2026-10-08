import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Loader2, Printer } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";
const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const PERTANYAAN = [
  { key: "proses_banding_dijelaskan", label: "Apakah Proses Banding telah dijelaskan kepada Anda?" },
  { key: "diskusi_dengan_asesor", label: "Apakah Anda telah mendiskusikan Banding dengan Asesor?" },
  { key: "melibatkan_orang_lain", label: "Apakah Anda mau melibatkan orang lain membantu Anda dalam Proses Banding?" }
];

export default function FRAK04Detail({ role = "admin" }) { // role prop = "admin" atau "asesor"
  const { id_peserta } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoint = role === "admin" ? `/admin/fr-ak04/${id_peserta}` : `/asesor/fr-ak04/${id_peserta}`;
        const response = await api.get(endpoint);
        setFormData(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Gagal memuat data FR.AK.04 atau form belum diisi.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id_peserta, role]);

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      const endpoint = role === "admin" ? `/admin/fr-ak04/pdf/${id_peserta}` : `/asesor/fr-ak04/pdf/${id_peserta}`;
      const response = await api.get(endpoint, { responseType: "blob" });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `FR-AK-04-${id_peserta}.pdf`;
      document.body.appendChild(link);
      link.click(); link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Gagal mengunduh PDF FR.AK.04.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (error) return <div className="p-8 text-center text-red-600 font-bold">{error}</div>;

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-4 md:p-8">
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="mb-5 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#071E3D] shadow-sm hover:bg-[#071E3D] hover:text-white transition-all">
            <ArrowLeft size={17} /> Kembali
          </button>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-[#071E3D] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-orange-500 transition-all">
              <Printer size={16} /> Cetak
            </button>
            <button onClick={handleDownloadPdf} disabled={downloading} className="inline-flex items-center gap-2 rounded-xl bg-[#071E3D] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-orange-500 transition-all disabled:opacity-60">
              {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} PDF
            </button>
          </div>
        </div>

        <section className="overflow-hidden rounded-[4px] border border-slate-200 bg-white shadow-sm print:shadow-none">
          <div className="border-b border-slate-300 bg-slate-100 px-6 py-5 text-center">
            <h1 className="text-[18px] font-black text-[#071E3D]">FR.AK.04. BANDING ASESMEN (Read Only)</h1>
          </div>
          
          {/* IDENTITAS ASESI & ASESOR */}
          <table className="w-full border-collapse border-b border-slate-300">
            <tbody>
              <InfoRow label="Nama Asesi" value={formData.nama_asesi} />
              <InfoRow label="Nama Asesor" value={formData.nama_asesor} />
              <InfoRow label="Tanggal Asesmen" value={formatTanggal(formData.tanggal_asesmen)} />
            </tbody>
          </table>

          {/* JAWABAN YA/TIDAK */}
          <div className="overflow-x-auto border-b border-slate-300">
            <table className="w-full min-w-[850px] border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="w-[58px] border border-slate-300 px-2 py-4 text-center text-[12px] font-black text-[#071E3D]">No.</th>
                  <th className="border border-slate-300 px-4 py-4 text-left text-[12px] font-black text-[#071E3D]">Pertanyaan</th>
                  <th className="w-[72px] border border-slate-300 px-2 py-4 text-center text-[12px] font-black text-[#071E3D]">YA</th>
                  <th className="w-[72px] border border-slate-300 px-2 py-4 text-center text-[12px] font-black text-[#071E3D]">TIDAK</th>
                </tr>
              </thead>
              <tbody>
                {PERTANYAAN.map((item, index) => (
                  <tr key={item.key}>
                    <td className="border border-slate-300 px-3 py-5 text-center text-[12px] font-black text-[#071E3D]">{index + 1}</td>
                    <td className="border border-slate-300 px-4 py-5 text-[13px] font-medium text-[#071E3D]">{item.label}</td>
                    <td className="border border-slate-300 px-3 py-5 text-center">
                      <input type="checkbox" checked={formData[item.key] === "ya"} disabled className="h-5 w-5 accent-[#071E3D] opacity-100" />
                    </td>
                    <td className="border border-slate-300 px-3 py-5 text-center">
                      <input type="checkbox" checked={formData[item.key] === "tidak"} disabled className="h-5 w-5 accent-[#071E3D] opacity-100" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ALASAN BANDING */}
          <div className="p-5">
            <p className="text-[12px] font-bold text-[#071E3D] mb-2">Banding ini diajukan atas alasan sebagai berikut:</p>
            <div className="w-full min-h-[100px] rounded-md border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-[#071E3D]">
              {formData.alasan_banding}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <tr>
      <td className="w-[230px] border border-slate-300 bg-slate-50 px-3 py-3 text-[11px] font-black text-[#071E3D]">{label}</td>
      <td className="border border-slate-300 px-3 py-3 text-[11px] font-semibold text-[#071E3D]">{value || "-"}</td>
    </tr>
  );
}

function formatTanggal(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
}

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F1F5F9]">
      <div className="text-center">
        <Loader2 size={32} className="mx-auto animate-spin text-[#071E3D]" />
        <h2 className="mt-4 font-black text-[#071E3D]">Memuat Data...</h2>
      </div>
    </div>
  );
}