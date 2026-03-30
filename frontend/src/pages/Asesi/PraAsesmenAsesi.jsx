import React, { useEffect, useState } from "react";
import axios from "axios";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";

const API_BASE = import.meta.env.VITE_API_BASE;
const api = axios.create({ baseURL: API_BASE });

// Inject token
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

  // Fetch form data
  const fetchFormData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/asesi/pra-asesmen/form");
      if (!res.data?.data) throw new Error("Data form kosong dari server");
      setFormData(res.data.data);
    } catch (err) {
      console.error("Fetch form error:", err);
      alert(err.response?.data?.message || err.message || "Gagal mengambil data form");
      setFormData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormData();
  }, []);

  // Submit presensi
  const handleSubmit = async () => {
    if (!formData?.id_peserta) return alert("ID peserta tidak ditemukan");
    if (!formData.ttd_asesi_ready) return alert("TTD Asesi belum tersedia");
    if (formData.is_submitted) return alert("Anda sudah submit presensi");

    try {
      setSubmitting(true);
      const res = await api.post("/asesi/pra-asesmen/submit", {
        id_peserta: formData.id_peserta,
        catatan: catatan || "Hadir"
      });
      alert(res.data?.message || "Berhasil submit presensi");
      await fetchFormData(); // refresh status
      setCatatan("");
    } catch (err) {
      console.error("Submit error:", err);
      alert(err.response?.data?.message || err.message || "Gagal submit presensi");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!formData) return <div className="p-4">Data form tidak tersedia</div>;

  // Link download PDF langsung dari backend (backend sudah pakai req.user.id_user)
  const downloadLink = `${API_BASE}/asesi/pra-asesmen/download`;

  return (
    <div className="flex h-screen bg-gray-100">
      <SidebarAsesi open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-4">Form Pra Asesmen</h1>

        <div className="bg-white shadow-md rounded p-4 space-y-4">
          <div>
            <strong>Skema Sertifikasi:</strong>{" "}
            {formData.skema_sertifikasi?.jenis || "-"} - {formData.skema_sertifikasi?.judul || "-"} (
            {formData.skema_sertifikasi?.nomor || "-"})
          </div>
          <div>
            <strong>TUK:</strong> {formData.tuk?.jenis || "-"} - {formData.tuk?.nama || "-"}
          </div>
          <div><strong>Nama Asesor:</strong> {formData.nama_asesor || "-"}</div>
          <div><strong>Nama Asesi:</strong> {formData.nama_asesi || "-"}</div>
          <div>
            <strong>Jadwal Pelaksanaan:</strong>{" "}
            {formData.jadwal_pelaksanaan?.hari_tanggal || "-"} di {formData.jadwal_pelaksanaan?.tempat || "-"}
          </div>
          <div>
            <strong>TTD Asesi:</strong> {formData.ttd_asesi_ready ? "Sudah tersedia" : "Belum tersedia"}
          </div>
          <div>
            <strong>Status Submit:</strong> {formData.is_submitted ? "Sudah submit" : "Belum submit"}
          </div>

          <div>
            <label className="block font-medium mb-1">Catatan / Keterangan</label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full border rounded p-2"
              rows={3}
              placeholder="Hadir / Catatan lainnya"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || !formData.ttd_asesi_ready || formData.is_submitted}
            className={`px-4 py-2 rounded font-semibold text-white ${
              formData.ttd_asesi_ready && !formData.is_submitted ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {submitting ? "Submitting..." : formData.is_submitted ? "Sudah Submit" : "Submit Presensi"}
          </button>

          <a
            href={downloadLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Download PDF
          </a>
        </div>
      </div>
    </div>
  );
};

export default PraAsesmenAsesi;