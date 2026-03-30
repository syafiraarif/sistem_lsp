// src/pages/asesi/APL02.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;

const jenisPengalamanOptions = [
  { value: "hasil_karya_atau_produk", label: "Hasil karya atau produk" },
  { value: "pengalaman_pembuatan_laporan", label: "Pengalaman pembuatan laporan" },
  { value: "pengalaman_magang", label: "Pengalaman magang" },
  { value: "pengalaman_menjadi_narasumber", label: "Pengalaman menjadi narasumber" },
  { value: "pengalaman_kerja", label: "Pengalaman kerja" },
  { value: "pengalaman_pendidikan", label: "Pengalaman pendidikan" },
  { value: "pengalaman_proyek", label: "Pengalaman proyek" },
  { value: "pengalaman_studi_kasus", label: "Pengalaman studi kasus" },
];

const APL02 = () => {
  const { id_skema } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [units, setUnits] = useState([]);
  const [answers, setAnswers] = useState({}); // {id_unit: {kriteria_unjuk_kerja: {jawaban, jenis_pengalaman, dokumen}}}

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/asesi/apl02/${id_skema}/units`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUnits(res.data.data || []);
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || "Gagal memuat unit kompetensi");
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, [id_skema]);

  const handleChange = (id_unit, kriteria, field, value) => {
    setAnswers(prev => ({
      ...prev,
      [id_unit]: {
        ...prev[id_unit],
        [kriteria]: {
          ...prev[id_unit]?.[kriteria],
          [field]: value
        }
      }
    }));
  };

  const handleFileChange = (id_unit, kriteria, file) => {
    handleChange(id_unit, kriteria, "file_bukti", file);
  };

  const handleSubmit = async (id_unit, kriteria) => {
    const data = answers[id_unit][kriteria];
    if (!data || !data.jawaban || !data.jenis_pengalaman) {
      return alert("Jawaban dan jenis pengalaman wajib diisi!");
    }

    const formData = new FormData();
    formData.append("id_unit", id_unit);
    formData.append("id_aplikasi", localStorage.getItem("id_aplikasi"));
    formData.append("elemen_kompetensi", units.find(u => u.id_unit === id_unit).elemen_kriteria.elemen_kompetensi);
    formData.append("kriteria_unjuk_kerja", kriteria);
    formData.append("jawaban", data.jawaban);
    formData.append("jenis_pengalaman", data.jenis_pengalaman);
    if (data.nama_dokumen) formData.append("nama_dokumen", data.nama_dokumen);
    if (data.nomor_dokumen) formData.append("nomor_dokumen", data.nomor_dokumen);
    if (data.tanggal_dokumen) formData.append("tanggal_dokumen", data.tanggal_dokumen);
    if (data.catatan_bukti) formData.append("catatan_bukti", data.catatan_bukti);
    if (data.file_bukti) formData.append("file_bukti", data.file_bukti);

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE}/asesi/apl02/submit`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });
      alert("Jawaban berhasil disimpan!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Gagal submit jawaban");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <SidebarAsesi isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 p-6 md:p-8">
        <h2 className="text-2xl font-bold text-[#071E3D] mb-4">APL02 - Asesmen Mandiri</h2>

        {units.map(unit => (
          <div key={unit.id_unit} className="mb-6 border rounded p-4 bg-white shadow-sm">
            <h3 className="text-lg font-semibold">{unit.kode_unit} - {unit.judul_unit}</h3>
            <p className="italic mb-2">{unit.elemen_kriteria.elemen_kompetensi}</p>

            {unit.elemen_kriteria.kriteria_unjuk_kerja.map(kriteria => (
              <div key={kriteria} className="mb-4 border-t pt-2">
                <p className="font-medium">{kriteria}</p>

                <div className="flex gap-4 mt-2">
                  <label>
                    <span>Jawaban:</span>
                    <select
                      value={answers[unit.id_unit]?.[kriteria]?.jawaban || ""}
                      onChange={e => handleChange(unit.id_unit, kriteria, "jawaban", e.target.value)}
                      className="border rounded p-1"
                      required
                    >
                      <option value="">Pilih</option>
                      <option value="k">Kompeten (K)</option>
                      <option value="bk">Belum Kompeten (BK)</option>
                    </select>
                  </label>

                  <label>
                    <span>Jenis Pengalaman:</span>
                    <select
                      value={answers[unit.id_unit]?.[kriteria]?.jenis_pengalaman || ""}
                      onChange={e => handleChange(unit.id_unit, kriteria, "jenis_pengalaman", e.target.value)}
                      className="border rounded p-1"
                      required
                    >
                      <option value="">Pilih</option>
                      {jenisPengalamanOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Nama Dokumen"
                    value={answers[unit.id_unit]?.[kriteria]?.nama_dokumen || ""}
                    onChange={e => handleChange(unit.id_unit, kriteria, "nama_dokumen", e.target.value)}
                    className="border rounded p-1"
                  />
                  <input
                    type="text"
                    placeholder="Nomor Dokumen"
                    value={answers[unit.id_unit]?.[kriteria]?.nomor_dokumen || ""}
                    onChange={e => handleChange(unit.id_unit, kriteria, "nomor_dokumen", e.target.value)}
                    className="border rounded p-1"
                  />
                  <input
                    type="date"
                    value={answers[unit.id_unit]?.[kriteria]?.tanggal_dokumen || ""}
                    onChange={e => handleChange(unit.id_unit, kriteria, "tanggal_dokumen", e.target.value)}
                    className="border rounded p-1"
                  />
                  <input
                    type="file"
                    onChange={e => handleFileChange(unit.id_unit, kriteria, e.target.files[0])}
                    className="border p-1"
                  />
                  <textarea
                    placeholder="Catatan Bukti"
                    value={answers[unit.id_unit]?.[kriteria]?.catatan_bukti || ""}
                    onChange={e => handleChange(unit.id_unit, kriteria, "catatan_bukti", e.target.value)}
                    className="border rounded p-1"
                  />
                </div>

                <button
                  type="button"
                  className="mt-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={() => handleSubmit(unit.id_unit, kriteria)}
                >
                  Simpan Jawaban
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default APL02;