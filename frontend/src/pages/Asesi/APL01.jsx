// src/pages/asesi/APL01.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import axios from "axios";

const APL01 = () => {
  const { id_skema } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [skema, setSkema] = useState(null);
  const [persyaratan, setPersyaratan] = useState([]);
  const [selectedPersyaratan, setSelectedPersyaratan] = useState([]);
  const [dokumenTambahan, setDokumenTambahan] = useState({}); // object {id_persyaratan: File}
  const [tujuan, setTujuan] = useState("");
  const [tujuanLainnya, setTujuanLainnya] = useState("");
  const [useTTD, setUseTTD] = useState(false);
  const [profileTTD, setProfileTTD] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");

        const skemaRes = await axios.get(
          `${API_BASE}/asesi/skema/${id_skema}/persyaratan`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPersyaratan(skemaRes.data.data || []);
        setSkema({ id_skema });

        const ttdRes = await axios.get(`${API_BASE}/asesi/profile/files`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ttdData = ttdRes.data?.data?.ttd || null;
        setProfileTTD(ttdData);
        if (ttdData) setUseTTD(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_BASE, id_skema, navigate]);

  const handlePersyaratanChange = (e) => {
    const id = parseInt(e.target.value);
    setSelectedPersyaratan((prev) =>
      e.target.checked ? [...prev, id] : prev.filter((v) => v !== id)
    );
    // Jika dicentang, buat placeholder file null
    if (e.target.checked && !dokumenTambahan[id]) {
      setDokumenTambahan((prev) => ({ ...prev, [id]: null }));
    }
    // Jika dicabut, hapus dari dokumenTambahan
    if (!e.target.checked) {
      setDokumenTambahan((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  const handleDokumenChange = (id, file) => {
    setDokumenTambahan((prev) => ({ ...prev, [id]: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi: semua persyaratan yang dipilih harus ada file
    for (const id of selectedPersyaratan) {
      if (!dokumenTambahan[id]) {
        alert("Semua persyaratan yang dicentang harus dilengkapi dengan dokumen!");
        return;
      }
    }

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("id_skema", skema.id_skema);
      formData.append("selected_persyaratan", JSON.stringify(selectedPersyaratan));
      formData.append("tujuan_asesmen", tujuan);
      if (tujuan === "lainnya") formData.append("tujuan_asesmen_lainnya", tujuanLainnya);

      // Tambahkan dokumen per persyaratan
      selectedPersyaratan.forEach((id) => {
        formData.append(`dokumen_tambahan[${id}]`, dokumenTambahan[id]);
      });

      if (useTTD && profileTTD) {
        formData.append("tanda_tangan", profileTTD);
      }

      await axios.post(`${API_BASE}/asesi/aplikasi`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Aplikasi APL01 berhasil disubmit!");
      navigate("/asesi/jadwal-saya");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Terjadi kesalahan saat submit.");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <SidebarAsesi isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 p-6 md:p-8">
        <h2 className="text-2xl font-bold text-[#071E3D] mb-4">
          APL01 - Formulir Aplikasi Asesmen
        </h2>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow-sm border border-[#071E3D]/10"
        >
          {/* Persyaratan */}
          <div className="mb-4">
            <h3 className="font-semibold text-[#071E3D]">Persyaratan Skema</h3>
            {persyaratan.length > 0 ? (
              persyaratan.map((p) => (
                <div key={p.id_persyaratan} className="mb-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={p.id_persyaratan}
                      onChange={handlePersyaratanChange}
                      checked={selectedPersyaratan.includes(p.id_persyaratan)}
                    />
                    {p.nama_persyaratan || `Persyaratan ${p.id_persyaratan}`}{" "}
                    {p.wajib ? "(Wajib)" : ""}
                  </label>

                  {/* Upload dokumen per persyaratan */}
                  {selectedPersyaratan.includes(p.id_persyaratan) && (
                    <input
                      type="file"
                      onChange={(e) =>
                        handleDokumenChange(p.id_persyaratan, e.target.files[0])
                      }
                      className="ml-6 mt-1"
                      required
                    />
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500">Tidak ada persyaratan untuk skema ini.</p>
            )}
          </div>

          {/* Tujuan asesmen */}
          <div className="mb-4">
            <label className="block font-semibold text-[#071E3D] mb-1">
              Tujuan Asesmen
            </label>
            <select
              className="border rounded p-2 w-full"
              value={tujuan}
              onChange={(e) => setTujuan(e.target.value)}
              required
            >
              <option value="">Pilih Tujuan</option>
              <option value="sertifikasi">Sertifikasi</option>
              <option value="sertifikasi_ulang">Sertifikasi Ulang</option>
              <option value="pengakuan_kompetensi_terkini">
                Pengakuan Kompetensi Terkini
              </option>
              <option value="rekognisi_pembelajaran_lampau">
                Rekognisi Pembelajaran Lampau
              </option>
              <option value="lainnya">Lainnya</option>
            </select>
            {tujuan === "lainnya" && (
              <input
                type="text"
                placeholder="Tujuan lainnya"
                value={tujuanLainnya}
                onChange={(e) => setTujuanLainnya(e.target.value)}
                className="border rounded p-2 mt-2 w-full"
                required
              />
            )}
          </div>

          {/* Tanda tangan */}
          <div className="mb-4">
            <label className="block font-semibold text-[#071E3D] mb-1">
              Tanda Tangan
            </label>
            {profileTTD ? (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={useTTD}
                  onChange={(e) => setUseTTD(e.target.checked)}
                />
                Gunakan TTD Profil
              </label>
            ) : (
              <p className="text-red-500">
                TTD belum ada di profil. Silakan upload dulu di ProfileDokumen.
              </p>
            )}
            {profileTTD && useTTD && (
              <img src={profileTTD} alt="TTD Profil" className="mt-2 w-40 border" />
            )}
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Submit APL01
          </button>
        </form>
      </div>
    </div>
  );
};

export default APL01;