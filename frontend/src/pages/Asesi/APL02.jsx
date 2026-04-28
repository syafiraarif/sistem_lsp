// src/pages/asesi/APL02.jsx
// versi UI upgrade (logic tetap sama)

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import axios from "axios";
import { Loader2, FileText, CheckCircle } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE;

const jenisPengalamanOptions = [
  { value: "hasil_karya_atau_produk", label: "Hasil karya / produk" },
  { value: "pengalaman_pembuatan_laporan", label: "Pembuatan laporan" },
  { value: "pengalaman_magang", label: "Magang" },
  { value: "pengalaman_menjadi_narasumber", label: "Narasumber" },
  { value: "pengalaman_kerja", label: "Kerja" },
  { value: "pengalaman_pendidikan", label: "Pendidikan" },
  { value: "pengalaman_proyek", label: "Proyek" },
  { value: "pengalaman_studi_kasus", label: "Studi kasus" },
];

export default function APL02() {
  const { id_skema } = useParams();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [units, setUnits] = useState([]);
  const [answers, setAnswers] = useState({});

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `${API_BASE}/asesi/apl02/${id_skema}/units`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setUnits(res.data.data || []);
      } catch (err) {
        alert("Gagal memuat unit");
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, [id_skema]);

  /* ================= HANDLE ================= */
  const handleChange = (id_unit, kriteria, field, value) => {
    setAnswers((prev) => ({
      ...prev,
      [id_unit]: {
        ...prev[id_unit],
        [kriteria]: {
          ...prev[id_unit]?.[kriteria],
          [field]: value,
        },
      },
    }));
  };

  const handleSubmit = async (id_unit, kriteria) => {
    const data = answers[id_unit]?.[kriteria];

    if (!data?.jawaban || !data?.jenis_pengalaman) {
      return alert("Jawaban & jenis pengalaman wajib!");
    }

    const formData = new FormData();

    formData.append("id_unit", id_unit);
    formData.append("id_aplikasi", localStorage.getItem("id_aplikasi"));
    formData.append("kriteria_unjuk_kerja", kriteria);
    formData.append("jawaban", data.jawaban);
    formData.append("jenis_pengalaman", data.jenis_pengalaman);

    if (data.file_bukti) formData.append("file_bukti", data.file_bukti);

    try {
      const token = localStorage.getItem("token");

      await axios.post(`${API_BASE}/asesi/apl02/submit`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("✅ Berhasil disimpan");
    } catch {
      alert("❌ Gagal submit");
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-orange-500" size={40} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <SidebarAsesi isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 p-6 md:p-8">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#071E3D]">
            APL02 - Asesmen Mandiri
          </h1>
          <p className="text-gray-500 mt-1">
            Isi bukti kompetensi Anda berdasarkan pengalaman
          </p>
        </div>

        {/* LIST UNIT */}
        <div className="space-y-6">
          {units.map((unit) => (
            <div
              key={unit.id_unit}
              className="bg-white rounded-2xl shadow border p-6"
            >
              {/* UNIT HEADER */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-[#071E3D]">
                  {unit.kode_unit} - {unit.judul_unit}
                </h3>
                <p className="text-sm text-gray-500 italic">
                  {unit.elemen_kriteria.elemen_kompetensi}
                </p>
              </div>

              {/* KRITERIA */}
              {unit.elemen_kriteria.kriteria_unjuk_kerja.map((kriteria) => (
                <div
                  key={kriteria}
                  className="border-t pt-4 mt-4 space-y-3"
                >
                  <p className="font-semibold text-[#071E3D]">
                    {kriteria}
                  </p>

                  {/* SELECT */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <select
                      value={
                        answers[unit.id_unit]?.[kriteria]?.jawaban || ""
                      }
                      onChange={(e) =>
                        handleChange(
                          unit.id_unit,
                          kriteria,
                          "jawaban",
                          e.target.value
                        )
                      }
                      className="p-3 border rounded-xl"
                    >
                      <option value="">Pilih Jawaban</option>
                      <option value="k">Kompeten</option>
                      <option value="bk">Belum Kompeten</option>
                    </select>

                    <select
                      value={
                        answers[unit.id_unit]?.[kriteria]
                          ?.jenis_pengalaman || ""
                      }
                      onChange={(e) =>
                        handleChange(
                          unit.id_unit,
                          kriteria,
                          "jenis_pengalaman",
                          e.target.value
                        )
                      }
                      className="p-3 border rounded-xl"
                    >
                      <option value="">Jenis Pengalaman</option>
                      {jenisPengalamanOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* INPUT */}
                  <input
                    type="text"
                    placeholder="Nama Dokumen"
                    className="w-full p-3 border rounded-xl"
                    onChange={(e) =>
                      handleChange(
                        unit.id_unit,
                        kriteria,
                        "nama_dokumen",
                        e.target.value
                      )
                    }
                  />

                  <input
                    type="file"
                    className="w-full p-2 border rounded-xl"
                    onChange={(e) =>
                      handleChange(
                        unit.id_unit,
                        kriteria,
                        "file_bukti",
                        e.target.files[0]
                      )
                    }
                  />

                  <textarea
                    placeholder="Catatan bukti"
                    className="w-full p-3 border rounded-xl"
                    onChange={(e) =>
                      handleChange(
                        unit.id_unit,
                        kriteria,
                        "catatan_bukti",
                        e.target.value
                      )
                    }
                  />

                  {/* BUTTON */}
                  <button
                    onClick={() =>
                      handleSubmit(unit.id_unit, kriteria)
                    }
                    className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
                  >
                    <CheckCircle size={18} />
                    Simpan
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}