// frontend/src/pages/tuk/EditJadwal.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Save, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import SidebarTUK from "../../components/sidebar/SidebarTuk";

const EditJadwal = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const today = new Date().toISOString().split("T")[0];

  const bulanList = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember"
  ];

  const [form, setForm] = useState({
    kode_jadwal: "",
    id_skema: "",
    nama_kegiatan: "",
    tahun: "",
    periode_bulan: "",
    gelombang: "",
    kuota: "",
    tgl_awal: "",
    tgl_akhir: "",
    jam: "",
    pelaksanaan_uji: "luring",
    url_agenda: "",
    status: "draft"
  });

  /* ================= FETCH DETAIL ================= */
  useEffect(() => {

    const fetchData = async () => {

      try {

        const res = await axios.get(
          `http://localhost:3000/api/tuk/jadwal/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        const data = res.data?.data;

        if (!data) return;

        setForm({
          kode_jadwal: data.kode_jadwal || "",
          id_skema: data.id_skema || "",
          nama_kegiatan: data.nama_kegiatan || "",
          tahun: data.tahun || "",
          periode_bulan: data.periode_bulan || "",
          gelombang: data.gelombang || "",
          kuota: data.kuota || "",
          tgl_awal: data.tgl_awal?.split("T")[0] || "",
          tgl_akhir: data.tgl_akhir?.split("T")[0] || "",
          jam: data.jam || "",
          pelaksanaan_uji: data.pelaksanaan_uji || "luring",
          url_agenda: data.url_agenda || "",
          status: data.status || "draft"
        });

      } catch (err) {

        setMsg({
          type: "error",
          text: "Gagal mengambil data jadwal"
        });

      } finally {
        setLoading(false);
      }
    };

    fetchData();

  }, [id]);

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  /* ================= UPDATE ================= */
  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setSaving(true);

      const payload = {
        ...form,
        tahun: parseInt(form.tahun) || null,
        kuota: parseInt(form.kuota) || null
      };

      await axios.put(
        `http://localhost:3000/api/tuk/jadwal/${id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMsg({
        type: "success",
        text: "Jadwal berhasil diperbarui!"
      });

      setTimeout(() => {
        navigate("/tuk/jadwal");
      }, 1500);

    } catch (err) {

      setMsg({
        type: "error",
        text: err.response?.data?.message || "Gagal update jadwal"
      });

    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">

      <SidebarTUK
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      <div className="flex-1 lg:ml-64 p-6">

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            Edit Jadwal
          </h1>
          <p className="text-gray-500 text-sm">
            Ubah data jadwal yang sudah dibuat
          </p>
        </div>

        {/* MESSAGE */}
        {msg.text && (
          <div className={`p-3 rounded mb-4 text-white flex items-center gap-2
            ${msg.type === "success" ? "bg-green-500" : "bg-red-500"}
          `}>
            {msg.type === "success"
              ? <CheckCircle size={18}/>
              : <AlertCircle size={18}/>
            }
            {msg.text}
          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-2xl shadow-md space-y-6"
        >

          <div className="font-bold border-b pb-1">
            Identitas
          </div>

          <input
            name="kode_jadwal"
            placeholder="Kode Jadwal"
            value={form.kode_jadwal}
            onChange={handleChange}
            className="p-3 border rounded w-full"
          />

          <input
            name="nama_kegiatan"
            placeholder="Nama Kegiatan"
            value={form.nama_kegiatan}
            onChange={handleChange}
            className="p-3 border rounded w-full"
          />

          <input
            type="number"
            name="tahun"
            placeholder="Tahun"
            value={form.tahun}
            onChange={handleChange}
            className="p-3 border rounded w-full"
          />

          <select
            name="periode_bulan"
            value={form.periode_bulan}
            onChange={handleChange}
            className="p-3 border rounded w-full"
          >
            <option value="">Pilih Bulan</option>
            {bulanList.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          <input
            name="gelombang"
            placeholder="Gelombang"
            value={form.gelombang}
            onChange={handleChange}
            className="p-3 border rounded w-full"
          />

          <input
            type="number"
            name="kuota"
            placeholder="Kuota"
            value={form.kuota}
            onChange={handleChange}
            className="p-3 border rounded w-full"
          />

          <input
            type="date"
            name="tgl_awal"
            value={form.tgl_awal}
            onChange={handleChange}
            className="p-3 border rounded w-full"
          />

          <input
            type="date"
            name="tgl_akhir"
            value={form.tgl_akhir}
            onChange={handleChange}
            className="p-3 border rounded w-full"
          />

          <input
            type="time"
            name="jam"
            value={form.jam}
            onChange={handleChange}
            className="p-3 border rounded w-full"
          />

          <div className="font-medium">
            Tipe Pelaksanaan
          </div>

          <div className="grid grid-cols-4 gap-2">
            {["luring","daring","hybrid","onsite"].map(t => (
              <button
                type="button"
                key={t}
                onClick={() =>
                  setForm({ ...form, pelaksanaan_uji: t })
                }
                className={`p-2 border rounded capitalize
                  ${form.pelaksanaan_uji === t
                    ? "bg-orange-500 text-white"
                    : ""}
                `}
              >
                {t}
              </button>
            ))}
          </div>

          <input
            name="url_agenda"
            placeholder="URL Agenda"
            value={form.url_agenda}
            onChange={handleChange}
            className="p-3 border rounded w-full"
          />

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-orange-500 text-white p-3 rounded-lg hover:bg-orange-600 flex items-center justify-center gap-2"
          >
            <Save size={18} />
            {saving ? "Menyimpan..." : "Update Jadwal"}
          </button>

        </form>

      </div>
    </div>
  );
};

export default EditJadwal;